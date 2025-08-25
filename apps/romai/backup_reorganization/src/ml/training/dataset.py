"""
Romanian Training Dataset for RomAI AGI
Cultural and linguistic dataset for training Romanian AGI capabilities

This module provides training data specifically designed for:
- Romanian language understanding
- Cultural context processing
- Diacritic pattern learning
- Regional variation awareness
"""

import torch
from torch.utils.data import Dataset, DataLoader
import json
import os
import random
from typing import List, Dict, Any, Optional, Tuple
from transformers import AutoTokenizer
import logging

class RomanianAGIDataset(Dataset):
    """
    Romanian AGI training dataset with cultural and linguistic samples
    """
    
    def __init__(self, 
                 max_length: int = 512,
                 tokenizer_name: str = "distilbert-base-multilingual-cased"):
        
        self.max_length = max_length
        self.tokenizer = AutoTokenizer.from_pretrained(tokenizer_name)
        
        # Initialize dataset
        self.samples = []
        self.generate_training_samples()
        
        # Setup logging
        self.logger = logging.getLogger('romanian_dataset')
        self.logger.info(f"Romanian AGI Dataset initialized with {len(self.samples)} samples")
    
    def generate_training_samples(self):
        """Generate comprehensive Romanian training samples"""
        
        # Romanian text samples with cultural context
        romanian_samples = [
            # Basic conversational Romanian
            "Salut! Cum te simți astăzi? Sper că ai o zi frumoasă.",
            "Bună dimineața! Ce planuri ai pentru ziua de azi?",
            "Îmi pare rău să aud asta. Cum pot să te ajut?",
            "Felicitări pentru realizarea ta! Ești foarte talentat.",
            "România este o țară frumoasă cu o cultură bogată și tradițiiFavorite vechi.",
            
            # Romanian cultural content
            "Miorița este una dintre cele mai frumoase balade populare românești, care exprimă dragostea pentru natură și acceptarea destinului.",
            "Brâncuși a fost un sculptor român renumit mondial, cunoscut pentru operele sale precum Coloana Infinitului și Pasărea în zbor.",
            "Tradițiile românești de Crăciun includ colinde, steaua, și masa de Ajun cu douăsprezece feluri de mâncare.",
            "Carpații sunt munții României, cu peisaje spectaculoase și o biodiversitate unică în Europa.",
            "Nicolae Iorga a fost un istoric și om politic român, una dintre personalitățile marcante ale culturii române.",
            
            # Regional variations
            "În Moldova se spune 'borș' pentru supa tradițională, iar în Transilvania 'ciorbă de burtă' este foarte populară.",
            "Ardealul are o istorie complexă, cu influențe habsburgice și tradițiile săsești și maghiare.",
            "Dobrogea este regiunea cu cea mai mare diversitate etnică din România, cu comunitățile turcă, tătară și bulgară.",
            "Oltenia este cunoscută pentru folclorul său vibrant și pentru ceramica de Horezu.",
            "Maramureșul păstrează arhitectura tradițională în lemn și portul popular autentic.",
            
            # Technical and modern Romanian
            "Dezvoltarea inteligenței artificiale în România se accelerează prin cercetare universitară și startup-uri inovatoare.",
            "Algoritmi de învățare automată pot procesa limba română cu diacritice și structuri morfologice complexe.",
            "România investește în digitalizare și tehnologia informației pentru a deveni un hub tehnologic regional.",
            "Sectorul IT din România contribuie semnificativ la PIB și oferă soluții software de nivel mondial.",
            "Universitatea Politehnica din București dezvoltă programe avansate de inteligență artificială și robotică.",
            
            # Complex linguistic structures
            "Dacă ar fi să aleg între toate posibilitățile, aș spune că cele mai frumoase clădiri sunt castelele din Transilvania.",
            "Știu că nu e ușor să înveți română, dar cu răbdare și practică, vei reuși să vorbești fluent.",
            "Își amintea de copilărie când mergea la bunica în sat și asculta povești despre daci și romani.",
            "Pentru că vremea se schimbă rapid, oamenii au început să se adapteze la noile condiții climatice.",
            "Deși este o limbă complexă, româna are o muzicalitate și o expresivitate care o fac unică în Europa.",
            
            # Instructions and explanations
            "Pentru a înțelege cultura română, trebuie să citești literatura clasică și să participi la tradițiile populare.",
            "Primul pas în învățarea românei este să înțelegi alfabetul și să pronunți corect diacriticele.",
            "Explicațiile despre gramatica română includ cele cinci cazuri și acordul substantivului cu adjectivul.",
            "Când călătorești în România, este util să știi expresii de politețe și să respecți obiceiurile locale.",
            "Gastronomia românească combină influențe balcanice, austriece și turcești într-un mod unic și savuros.",
            
            # Questions and answers
            "Întrebare: Ce este mămăliga? Răspuns: Mămăliga este o mâncare tradițională românească făcută din mălai fierbinte.",
            "Întrebare: Cine a fost Mihai Eminescu? Răspuns: Eminescu a fost cel mai mare poet român, cunoscut pentru 'Luceafărul'.",
            "Întrebare: Unde se află Brașovul? Răspuns: Brașovul este în centrul României, în apropierea Carpaților.",
            "Întrebare: Ce sărbătoresc românii pe 1 Decembrie? Răspuns: Ziua Națională a României, Ziua Marii Uniri.",
            "Întrebare: Care sunt diacriticele românești? Răspuns: ă, â, î, ș, ț sunt cele cinci diacritice specifice.",
        ]
        
        # Generate training pairs (input-output for language modeling)
        for text in romanian_samples:
            # For language modeling, input and target are the same (shifted)
            sample = {
                'text': text,
                'input_text': text,
                'target_text': text,
                'task_type': 'language_modeling',
                'cultural_context': True,
                'language': 'romanian'
            }
            self.samples.append(sample)
        
        # Add instruction-following samples
        instruction_samples = [
            {
                'input_text': "Traduce în română: Hello, how are you today?",
                'target_text': "Salut, cum te simți astăzi?",
                'task_type': 'translation',
                'cultural_context': True,
                'language': 'romanian'
            },
            {
                'input_text': "Explică tradițiile românești de Paște.",
                'target_text': "Tradițiile românești de Paște includ vopsitul ouălor, prepararea cozonacului și mielului, mersul la biserică în noaptea Învierii și strigarea 'Hristos a înviat!'",
                'task_type': 'explanation',
                'cultural_context': True,
                'language': 'romanian'
            },
            {
                'input_text': "Care sunt cele mai importante orașe din România?",
                'target_text': "Cele mai importante orașe din România sunt București (capitala), Cluj-Napoca, Timișoara, Iași, Constanța, Craiova, Brașov și Galați.",
                'task_type': 'factual_question',
                'cultural_context': True,
                'language': 'romanian'
            }
        ]
        
        self.samples.extend(instruction_samples)
        
        # Shuffle the dataset
        random.shuffle(self.samples)
    
    def __len__(self):
        return len(self.samples)
    
    def __getitem__(self, idx):
        sample = self.samples[idx]
        
        # Tokenize the text
        if sample['task_type'] == 'language_modeling':
            # For language modeling, use the same text as input and target
            encoding = self.tokenizer(
                sample['text'],
                truncation=True,
                padding='max_length',
                max_length=self.max_length,
                return_tensors='pt'
            )
            
            input_ids = encoding['input_ids'].squeeze()
            attention_mask = encoding['attention_mask'].squeeze()
            
            # For causal language modeling, labels are the same as input_ids
            labels = input_ids.clone()
            
        else:
            # For instruction following tasks
            input_encoding = self.tokenizer(
                sample['input_text'],
                truncation=True,
                padding='max_length',
                max_length=self.max_length // 2,
                return_tensors='pt'
            )
            
            target_encoding = self.tokenizer(
                sample['target_text'],
                truncation=True,
                padding='max_length',
                max_length=self.max_length // 2,
                return_tensors='pt'
            )
            
            # Combine input and target
            input_ids = torch.cat([input_encoding['input_ids'].squeeze(), 
                                 target_encoding['input_ids'].squeeze()])
            attention_mask = torch.cat([input_encoding['attention_mask'].squeeze(),
                                      target_encoding['attention_mask'].squeeze()])
            
            # Labels: -100 for input tokens, target tokens for output
            labels = torch.cat([
                torch.full_like(input_encoding['input_ids'].squeeze(), -100),
                target_encoding['input_ids'].squeeze()
            ])
        
        return {
            'input_ids': input_ids,
            'attention_mask': attention_mask,
            'labels': labels,
            'task_type': sample['task_type'],
            'cultural_context': sample['cultural_context']
        }

class RomanianDataModule:
    """
    Data module for Romanian AGI training with train/validation splits
    """
    
    def __init__(self, 
                 batch_size: int = 4,
                 max_length: int = 512,
                 num_workers: int = 2,
                 train_split: float = 0.8):
        
        self.batch_size = batch_size
        self.max_length = max_length
        self.num_workers = num_workers
        self.train_split = train_split
        
        # Initialize dataset
        self.dataset = RomanianAGIDataset(max_length=max_length)
        
        # Split dataset
        train_size = int(len(self.dataset) * train_split)
        val_size = len(self.dataset) - train_size
        
        self.train_dataset, self.val_dataset = torch.utils.data.random_split(
            self.dataset, [train_size, val_size]
        )
        
        logging.info(f"Data module initialized: {train_size} train, {val_size} val samples")
    
    def train_dataloader(self):
        return DataLoader(
            self.train_dataset,
            batch_size=self.batch_size,
            shuffle=True,
            num_workers=self.num_workers,
            pin_memory=True
        )
    
    def val_dataloader(self):
        return DataLoader(
            self.val_dataset,
            batch_size=self.batch_size,
            shuffle=False,
            num_workers=self.num_workers,
            pin_memory=True
        )
    
    def get_sample_batch(self):
        """Get a sample batch for testing"""
        return next(iter(self.train_dataloader()))

# Training data statistics and utilities
def get_dataset_stats(dataset: RomanianAGIDataset) -> Dict[str, Any]:
    """Get comprehensive statistics about the training dataset"""
    
    stats = {
        'total_samples': len(dataset),
        'task_types': {},
        'avg_length': 0,
        'cultural_samples': 0,
        'romanian_samples': 0
    }
    
    total_length = 0
    
    for sample in dataset.samples:
        # Count task types
        task_type = sample['task_type']
        stats['task_types'][task_type] = stats['task_types'].get(task_type, 0) + 1
        
        # Count cultural and Romanian samples
        if sample.get('cultural_context', False):
            stats['cultural_samples'] += 1
        if sample.get('language') == 'romanian':
            stats['romanian_samples'] += 1
        
        # Calculate average length
        total_length += len(sample.get('text', sample.get('input_text', '')))
    
    stats['avg_length'] = total_length / len(dataset) if len(dataset) > 0 else 0
    
    return stats

if __name__ == "__main__":
    # Test the dataset
    dataset = RomanianAGIDataset()
    data_module = RomanianDataModule(batch_size=2)
    
    print("Dataset Statistics:")
    stats = get_dataset_stats(dataset)
    print(json.dumps(stats, indent=2, ensure_ascii=False))
    
    print("\nSample batch:")
    batch = data_module.get_sample_batch()
    print(f"Input IDs shape: {batch['input_ids'].shape}")
    print(f"Attention mask shape: {batch['attention_mask'].shape}")
    print(f"Labels shape: {batch['labels'].shape}")
    
    # Decode a sample
    tokenizer = dataset.tokenizer
    sample_text = tokenizer.decode(batch['input_ids'][0], skip_special_tokens=True)
    print(f"Sample text: {sample_text[:100]}...")
