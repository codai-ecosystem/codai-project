fn main() {
    // Simple build script for now
    println!("cargo:rerun-if-changed=build.rs");
}
