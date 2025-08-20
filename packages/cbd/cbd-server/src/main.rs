/*!
 * CBD Enterprise Server Binary
 * Production-ready CBD database server
 */

use cbd_server::*;
use anyhow::{Result, Context};
use clap::{Parser, Subcommand};
use std::path::PathBuf;
use tracing::{info, error};
use tracing_subscriber::{layer::SubscriberExt, util::SubscriberInitExt};

#[derive(Parser)]
#[command(name = "cbd-server")]
#[command(about = "CBD Enterprise Database Server")]
#[command(long_about = "High-performance vector database with enterprise features")]
#[command(version = env!("CARGO_PKG_VERSION"))]
struct Cli {
    #[command(subcommand)]
    command: Commands,
    
    /// Configuration file path
    #[arg(short, long, value_name = "FILE")]
    config: Option<PathBuf>,
    
    /// Log level (trace, debug, info, warn, error)
    #[arg(short, long, default_value = "info")]
    log_level: String,
    
    /// Enable JSON logging
    #[arg(long)]
    json_logs: bool,
}

#[derive(Subcommand)]
enum Commands {
    /// Start the CBD server
    Start {
        /// Server bind address
        #[arg(long, default_value = "0.0.0.0")]
        bind_address: String,
        
        /// gRPC port
        #[arg(long, default_value_t = 8080)]
        grpc_port: u16,
        
        /// REST API port
        #[arg(long, default_value_t = 8081)]
        rest_port: u16,
        
        /// Admin port
        #[arg(long, default_value_t = 8082)]
        admin_port: u16,
        
        /// Database storage path
        #[arg(long, default_value = "./cbd-data")]
        data_dir: PathBuf,
        
        /// Vector dimensions
        #[arg(long, default_value_t = 384)]
        vector_dimensions: u32,
        
        /// Enable clustering
        #[arg(long)]
        enable_cluster: bool,
        
        /// Cluster node ID
        #[arg(long)]
        node_id: Option<String>,
        
        /// Cluster peers (comma-separated)
        #[arg(long)]
        cluster_peers: Option<String>,
    },
    
    /// Check server health
    Health {
        /// Server address
        #[arg(long, default_value = "127.0.0.1:8080")]
        server: String,
    },
    
    /// Show server statistics
    Stats {
        /// Server address
        #[arg(long, default_value = "127.0.0.1:8080")]
        server: String,
        
        /// Show detailed stats
        #[arg(long)]
        detailed: bool,
    },
    
    /// Validate configuration
    ValidateConfig {
        /// Configuration file path
        config_file: PathBuf,
    },
    
    /// Generate default configuration
    GenerateConfig {
        /// Output file path
        #[arg(long, default_value = "cbd-server.yaml")]
        output: PathBuf,
        
        /// Configuration format (yaml, json, toml)
        #[arg(long, default_value = "yaml")]
        format: String,
    },
    
    /// Benchmark the server
    Benchmark {
        /// Server address
        #[arg(long, default_value = "127.0.0.1:8080")]
        server: String,
        
        /// Number of operations
        #[arg(long, default_value_t = 1000)]
        operations: u32,
        
        /// Number of concurrent clients
        #[arg(long, default_value_t = 10)]
        concurrency: u32,
        
        /// Vector dimensions
        #[arg(long, default_value_t = 384)]
        dimensions: u32,
        
        /// Benchmark type (store, search, mixed)
        #[arg(long, default_value = "mixed")]
        benchmark_type: String,
    },
}

#[tokio::main]
async fn main() -> Result<()> {
    let cli = Cli::parse();
    
    // Initialize logging
    init_logging(&cli.log_level, cli.json_logs)?;
    
    match cli.command {
        Commands::Start {
            bind_address,
            grpc_port,
            rest_port,
            admin_port,
            data_dir,
            vector_dimensions,
            enable_cluster,
            node_id,
            cluster_peers,
        } => {
            start_server(
                cli.config,
                bind_address,
                grpc_port,
                rest_port,
                admin_port,
                data_dir,
                vector_dimensions,
                enable_cluster,
                node_id,
                cluster_peers,
            ).await
        }
        Commands::Health { server } => check_health(&server).await,
        Commands::Stats { server, detailed } => show_stats(&server, detailed).await,
        Commands::ValidateConfig { config_file } => validate_config(&config_file).await,
        Commands::GenerateConfig { output, format } => generate_config(&output, &format).await,
        Commands::Benchmark {
            server,
            operations,
            concurrency,
            dimensions,
            benchmark_type,
        } => run_benchmark(&server, operations, concurrency, dimensions, &benchmark_type).await,
    }
}

/// Initialize logging
fn init_logging(log_level: &str, json_logs: bool) -> Result<()> {
    let level = log_level.parse().context("Invalid log level")?;
    
    if json_logs {
        tracing_subscriber::registry()
            .with(tracing_subscriber::fmt::layer().json())
            .with(tracing_subscriber::EnvFilter::from_default_env().add_directive(level))
            .try_init()
            .context("Failed to initialize JSON logging")?;
    } else {
        tracing_subscriber::registry()
            .with(tracing_subscriber::fmt::layer())
            .with(tracing_subscriber::EnvFilter::from_default_env().add_directive(level))
            .try_init()
            .context("Failed to initialize logging")?;
    }
    
    Ok(())
}

/// Start the CBD server
async fn start_server(
    config_path: Option<PathBuf>,
    bind_address: String,
    grpc_port: u16,
    rest_port: u16,
    admin_port: u16,
    data_dir: PathBuf,
    vector_dimensions: u32,
    enable_cluster: bool,
    node_id: Option<String>,
    cluster_peers: Option<String>,
) -> Result<()> {
    info!("Starting CBD Enterprise Server v{}", env!("CARGO_PKG_VERSION"));
    
    // Load or create configuration
    let config = if let Some(config_path) = config_path {
        load_config(&config_path).await?
    } else {
        create_default_config(
            bind_address,
            grpc_port,
            rest_port,
            admin_port,
            data_dir,
            vector_dimensions,
            enable_cluster,
            node_id,
            cluster_peers,
        )?
    };
    
    // Create and start server
    let server = CBDEnterpriseServer::new(config).await
        .context("Failed to create CBD server")?;
    
    // Handle graceful shutdown
    let shutdown_signal = async {
        tokio::signal::ctrl_c()
            .await
            .expect("Failed to listen for ctrl-c signal");
        info!("Received shutdown signal, gracefully shutting down...");
    };
    
    // Start server with graceful shutdown
    tokio::select! {
        result = server.start() => {
            match result {
                Ok(_) => info!("Server stopped successfully"),
                Err(e) => error!("Server error: {}", e),
            }
        }
        _ = shutdown_signal => {
            info!("Shutdown signal received");
        }
    }
    
    Ok(())
}

/// Load configuration from file
async fn load_config(config_path: &PathBuf) -> Result<ServerConfig> {
    let config_str = tokio::fs::read_to_string(config_path).await
        .context("Failed to read configuration file")?;
    
    let config: ServerConfig = if config_path.extension().and_then(|s| s.to_str()) == Some("yaml") {
        serde_yaml::from_str(&config_str)
            .context("Failed to parse YAML configuration")?
    } else {
        serde_json::from_str(&config_str)
            .context("Failed to parse JSON configuration")?
    };
    
    Ok(config)
}

/// Create default configuration
fn create_default_config(
    bind_address: String,
    grpc_port: u16,
    rest_port: u16,
    admin_port: u16,
    data_dir: PathBuf,
    vector_dimensions: u32,
    enable_cluster: bool,
    node_id: Option<String>,
    cluster_peers: Option<String>,
) -> Result<ServerConfig> {
    use cbd_core::*;
    
    let mut config = ServerConfig::default();
    
    // Network configuration
    config.server.bind_address = bind_address;
    config.server.grpc_port = grpc_port;
    config.server.rest_port = rest_port;
    config.server.admin_port = admin_port;
    
    // Database configuration
    config.database.storage_path = data_dir.to_string_lossy().to_string();
    config.database.vector_dimensions = vector_dimensions;
    config.database.enable_clustering = enable_cluster;
    
    if let Some(id) = node_id {
        config.database.node_id = Some(id);
    }
    
    if let Some(peers) = cluster_peers {
        config.database.cluster_peers = peers
            .split(',')
            .map(|s| s.trim().to_string())
            .collect();
    }
    
    Ok(config)
}

/// Check server health
async fn check_health(server_addr: &str) -> Result<()> {
    info!("Checking health of server at {}", server_addr);
    
    // TODO: Implement gRPC health check client
    println!("Health check not yet implemented");
    
    Ok(())
}

/// Show server statistics
async fn show_stats(server_addr: &str, detailed: bool) -> Result<()> {
    info!("Getting statistics from server at {}", server_addr);
    
    // TODO: Implement gRPC stats client
    println!("Statistics not yet implemented (detailed: {})", detailed);
    
    Ok(())
}

/// Validate configuration file
async fn validate_config(config_path: &PathBuf) -> Result<()> {
    info!("Validating configuration file: {:?}", config_path);
    
    let config = load_config(config_path).await?;
    
    // Validate configuration
    if config.server.grpc_port == config.server.rest_port {
        return Err(anyhow::anyhow!("gRPC and REST ports cannot be the same"));
    }
    
    if config.server.grpc_port == config.server.admin_port {
        return Err(anyhow::anyhow!("gRPC and admin ports cannot be the same"));
    }
    
    if config.server.rest_port == config.server.admin_port {
        return Err(anyhow::anyhow!("REST and admin ports cannot be the same"));
    }
    
    if config.database.vector_dimensions == 0 {
        return Err(anyhow::anyhow!("Vector dimensions must be greater than 0"));
    }
    
    info!("Configuration is valid");
    println!("✅ Configuration file is valid");
    
    Ok(())
}

/// Generate default configuration file
async fn generate_config(output_path: &PathBuf, format: &str) -> Result<()> {
    info!("Generating default configuration file: {:?}", output_path);
    
    let config = ServerConfig::default();
    
    let config_str = match format {
        "yaml" => serde_yaml::to_string(&config)
            .context("Failed to serialize configuration as YAML")?,
        "json" => serde_json::to_string_pretty(&config)
            .context("Failed to serialize configuration as JSON")?,
        "toml" => return Err(anyhow::anyhow!("TOML format not yet supported")),
        _ => return Err(anyhow::anyhow!("Unsupported format: {}", format)),
    };
    
    tokio::fs::write(output_path, config_str).await
        .context("Failed to write configuration file")?;
    
    info!("Configuration file generated successfully");
    println!("✅ Configuration file generated: {:?}", output_path);
    
    Ok(())
}

/// Run benchmark
async fn run_benchmark(
    server_addr: &str,
    operations: u32,
    concurrency: u32,
    dimensions: u32,
    benchmark_type: &str,
) -> Result<()> {
    info!("Running benchmark against server at {}", server_addr);
    info!("Operations: {}, Concurrency: {}, Dimensions: {}, Type: {}", 
          operations, concurrency, dimensions, benchmark_type);
    
    // TODO: Implement benchmark client
    println!("Benchmark not yet implemented");
    
    Ok(())
}
