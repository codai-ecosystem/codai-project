"""
Simplified Week 3 Training Execution
Quick validation of Romanian AGI training infrastructure
"""

import os
import sys
import torch
import pytorch_lightning as pl
import time
from pathlib import Path

def main():
    """Simple Week 3 training validation"""
    print("🇷🇴 RomAI AGI - Week 3 Training Infrastructure Validation")
    print("=" * 60)
    
    # Check PyTorch and GPU availability
    print(f"🔧 System Check:")
    print(f"   - PyTorch version: {torch.__version__}")
    print(f"   - CUDA available: {torch.cuda.is_available()}")
    print(f"   - CUDA device count: {torch.cuda.device_count() if torch.cuda.is_available() else 0}")
    if torch.cuda.is_available():
        print(f"   - Current device: {torch.cuda.current_device()}")
        print(f"   - Device name: {torch.cuda.get_device_name()}")
    
    # Check PyTorch Lightning
    print(f"   - PyTorch Lightning version: {pl.__version__}")
    
    # Create a simple model for testing
    print(f"\n🧠 Creating Test Model...")
    
    class SimpleRomAIModel(pl.LightningModule):
        def __init__(self, vocab_size=32000, d_model=256, num_layers=4):
            super().__init__()
            self.embedding = torch.nn.Embedding(vocab_size, d_model)
            self.transformer = torch.nn.TransformerEncoder(
                torch.nn.TransformerEncoderLayer(
                    d_model=d_model,
                    nhead=8,
                    dim_feedforward=1024,
                    dropout=0.1,
                    batch_first=True
                ),
                num_layers=num_layers
            )
            self.head = torch.nn.Linear(d_model, vocab_size)
            self.loss_fn = torch.nn.CrossEntropyLoss()
            
        def forward(self, x):
            x = self.embedding(x)
            x = self.transformer(x)
            return self.head(x)
            
        def training_step(self, batch, batch_idx):
            input_ids = batch['input_ids']
            # Shift labels for language modeling
            labels = input_ids[:, 1:].contiguous()
            input_ids = input_ids[:, :-1].contiguous()
            
            outputs = self(input_ids)
            loss = self.loss_fn(outputs.view(-1, outputs.size(-1)), labels.view(-1))
            
            self.log('train_loss', loss, prog_bar=True)
            return loss
            
        def validation_step(self, batch, batch_idx):
            input_ids = batch['input_ids']
            labels = input_ids[:, 1:].contiguous()
            input_ids = input_ids[:, :-1].contiguous()
            
            outputs = self(input_ids)
            loss = self.loss_fn(outputs.view(-1, outputs.size(-1)), labels.view(-1))
            
            self.log('val_loss', loss, prog_bar=True)
            return loss
            
        def configure_optimizers(self):
            return torch.optim.AdamW(self.parameters(), lr=1e-4, weight_decay=0.01)
    
    # Create simple dataset for testing
    print(f"\n📊 Creating Test Dataset...")
    
    class SimpleDataset(torch.utils.data.Dataset):
        def __init__(self, size=1000, seq_len=128, vocab_size=32000):
            self.size = size
            self.seq_len = seq_len
            self.vocab_size = vocab_size
            
        def __len__(self):
            return self.size
            
        def __getitem__(self, idx):
            # Generate random Romanian-like sequences
            input_ids = torch.randint(0, self.vocab_size, (self.seq_len,))
            return {'input_ids': input_ids}
    
    # Create datasets
    train_dataset = SimpleDataset(800, 128)
    val_dataset = SimpleDataset(200, 128)
    
    # Create data loaders
    train_loader = torch.utils.data.DataLoader(
        train_dataset, 
        batch_size=4, 
        shuffle=True,
        num_workers=0  # Avoid multiprocessing issues
    )
    val_loader = torch.utils.data.DataLoader(
        val_dataset, 
        batch_size=4, 
        shuffle=False,
        num_workers=0
    )
    
    print(f"   ✅ Train samples: {len(train_dataset)}")
    print(f"   ✅ Validation samples: {len(val_dataset)}")
    print(f"   ✅ Train batches: {len(train_loader)}")
    print(f"   ✅ Validation batches: {len(val_loader)}")
    
    # Initialize model
    print(f"\n🧠 Initializing Model...")
    model = SimpleRomAIModel(vocab_size=32000, d_model=256, num_layers=4)
    
    # Count parameters
    total_params = sum(p.numel() for p in model.parameters())
    trainable_params = sum(p.numel() for p in model.parameters() if p.requires_grad)
    
    print(f"   ✅ Total parameters: {total_params:,}")
    print(f"   ✅ Trainable parameters: {trainable_params:,}")
    
    # Create trainer
    print(f"\n⚡ Creating PyTorch Lightning Trainer...")
    
    # Create directories
    os.makedirs("lightning_logs", exist_ok=True)
    os.makedirs("checkpoints", exist_ok=True)
    
    trainer = pl.Trainer(
        max_epochs=1,  # Just 1 epoch for testing
        limit_train_batches=10,  # Just 10 batches
        limit_val_batches=3,     # Just 3 validation batches
        accelerator="auto",
        devices=1,
        precision=32,
        logger=pl.loggers.TensorBoardLogger("lightning_logs", name="romai_test"),
        callbacks=[
            pl.callbacks.ModelCheckpoint(
                dirpath="checkpoints",
                filename="romai-test-{epoch:02d}",
                save_top_k=1
            )
        ],
        enable_progress_bar=True,
        enable_model_summary=True,
        log_every_n_steps=5
    )
    
    print(f"   ✅ Max epochs: 1 (test mode)")
    print(f"   ✅ Accelerator: {trainer.accelerator}")
    print(f"   ✅ Precision: {trainer.precision}")
    
    # Test forward pass first
    print(f"\n🧪 Testing Forward Pass...")
    
    model.eval()
    with torch.no_grad():
        sample_batch = next(iter(train_loader))
        try:
            loss = model.training_step(sample_batch, 0)
            print(f"   ✅ Forward pass successful!")
            print(f"   📊 Sample loss: {loss:.4f}")
        except Exception as e:
            print(f"   ❌ Forward pass failed: {e}")
            return
    
    # Run training
    print(f"\n🚀 Starting Training...")
    print(f"   🧪 Test mode: 1 epoch, 10 training batches, 3 validation batches")
    
    try:
        trainer.fit(model, train_loader, val_loader)
        
        print(f"\n✅ Week 3 Training Infrastructure - SUCCESS!")
        print(f"   🎉 PyTorch Lightning training pipeline working!")
        print(f"   📊 Model training completed successfully")
        print(f"   🏁 Romanian AGI training infrastructure validated")
        
        # Test checkpoint saving
        checkpoint_path = "checkpoints/week3_validation_checkpoint.ckpt"
        trainer.save_checkpoint(checkpoint_path)
        print(f"   💾 Checkpoint saved: {checkpoint_path}")
        
        # Test model loading
        loaded_model = SimpleRomAIModel.load_from_checkpoint(checkpoint_path)
        print(f"   📥 Checkpoint loading verified")
        
    except Exception as e:
        print(f"\n❌ Training failed: {e}")
        import traceback
        traceback.print_exc()
        return
    
    print(f"\n🏆 Week 3 Infrastructure Validation Complete!")
    print(f"   ✅ PyTorch Lightning integration working")
    print(f"   ✅ Training pipeline functional")
    print(f"   ✅ Model checkpointing working")
    print(f"   ✅ Ready for full Romanian AGI training")
    
    print(f"\n📋 Next Steps for Full Implementation:")
    print(f"   1. Replace SimpleRomAIModel with actual RomAI hybrid architecture")
    print(f"   2. Replace SimpleDataset with Romanian corpus data")
    print(f"   3. Add Romanian cultural context processing")
    print(f"   4. Implement morphological analysis integration")
    print(f"   5. Scale to full dataset and training duration")

if __name__ == "__main__":
    main()
