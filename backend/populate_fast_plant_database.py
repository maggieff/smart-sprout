#!/usr/bin/env python3
"""
Smart Plant Tracker - Populate Fast Plant Database
==================================================

This script loads the fast plant care data and populates the Chroma Cloud
database with comprehensive plant care information.

Author: Smart Plant Tracker Team
"""

import json
import os
import sys
from chromadb import CloudClient
from chromadb.config import Settings
import openai
from typing import List, Dict, Any
from datetime import datetime

def load_fast_plant_data(filename: str = 'chroma_fast_plant_data.json') -> List[Dict[str, Any]]:
    """Load fast plant care data from JSON file."""
    file_path = os.path.join(os.path.dirname(__file__), filename)
    
    if not os.path.exists(file_path):
        print(f"❌ Error: {filename} not found. Please run fast_plant_database.py first.")
        return []
    
    with open(file_path, 'r', encoding='utf-8') as f:
        data = json.load(f)
    
    print(f"✅ Loaded {len(data)} plant care documents from {filename}")
    return data

def connect_to_chroma_cloud():
    """Connect to Chroma Cloud database."""
    try:
        client = CloudClient(
            api_key=os.getenv("CHROMA_API_KEY", "ck-GWpo9jeE6H2Trwa69Gt77zviEqx7EZTw7s1UpvMcGFGu"),
            tenant=os.getenv("CHROMA_TENANT", "36db7d89-6330-46bf-a396-2836596dbd9a"),
            database=os.getenv("CHROMA_DATABASE", "plants")
        )
        
        print("✅ Connected to Chroma Cloud")
        return client
        
    except Exception as e:
        print(f"❌ Error connecting to Chroma Cloud: {e}")
        return None

def create_plant_care_collection(client, collection_name: str = "fast_plant_care"):
    """Create or get the plant care knowledge collection."""
    try:
        # Try to get existing collection
        collection = client.get_collection(name=collection_name)
        print(f"📂 Found existing collection: {collection_name}")
        
    except:
        # Create new collection
        collection = client.create_collection(
            name=collection_name,
            metadata={
                "description": "Comprehensive Plant Care Knowledge Base",
                "created_at": datetime.now().isoformat(),
                "source": "Fast Plant Care Database"
            }
        )
        print(f"✅ Created new collection: {collection_name}")
    
    return collection

def add_plants_to_chroma(collection, plant_data: List[Dict[str, Any]]):
    """Add plant care data to Chroma Cloud collection."""
    print(f"\n📥 Adding {len(plant_data)} plant care documents to Chroma Cloud...")
    
    try:
        # Prepare data for ChromaDB
        documents = []
        metadatas = []
        ids = []
        
        for plant in plant_data:
            documents.append(plant['document'])
            metadatas.append(plant['metadata'])
            ids.append(plant['id'])
        
        # Add to ChromaDB in batches to avoid memory issues
        batch_size = 25
        total_added = 0
        
        for i in range(0, len(documents), batch_size):
            batch_docs = documents[i:i + batch_size]
            batch_metas = metadatas[i:i + batch_size]
            batch_ids = ids[i:i + batch_size]
            
            collection.add(
                documents=batch_docs,
                metadatas=batch_metas,
                ids=batch_ids
            )
            
            total_added += len(batch_docs)
            print(f"📊 Added batch {i//batch_size + 1}: {total_added}/{len(documents)} plants")
        
        print(f"✅ Successfully added {total_added} plant care documents to Chroma Cloud")
        return True
        
    except Exception as e:
        print(f"❌ Error adding plants to Chroma Cloud: {e}")
        return False

def test_collection(collection):
    """Test the populated collection with sample queries."""
    print("\n🧪 Testing collection with sample queries...")
    
    test_queries = [
        "How do I care for a Monstera plant?",
        "What are the watering requirements for succulents?",
        "How much light does a Snake Plant need?",
        "What are common problems with houseplants?",
        "How do I propagate Pothos plants?",
        "Tell me about cactus care",
        "What plants are good for beginners?",
        "How do I care for herbs?"
    ]
    
    for query in test_queries:
        print(f"\n🔍 Query: '{query}'")
        try:
            results = collection.query(
                query_texts=[query],
                n_results=3,
                include=['documents', 'metadatas', 'distances']
            )
            
            print(f"📊 Found {len(results['documents'][0])} results")
            
            for i, (doc, metadata, distance) in enumerate(zip(
                results['documents'][0],
                results['metadatas'][0],
                results['distances'][0]
            )):
                similarity = 1 - distance
                print(f"\n{i+1}. Similarity: {similarity:.3f}")
                print(f"   Plant: {metadata.get('name', 'Unknown')}")
                print(f"   Category: {metadata.get('category', 'Unknown')}")
                print(f"   Difficulty: {metadata.get('difficulty', 'Unknown')}")
                print(f"   Document: {doc[:150]}...")
        
        except Exception as e:
            print(f"❌ Error testing query '{query}': {e}")

def main():
    """Main function to populate fast plant care database."""
    print("🌱 Smart Plant Tracker - Populate Fast Plant Care Database")
    print("=" * 60)
    
    # Check for OpenAI API key
    if not os.getenv("OPENAI_API_KEY"):
        print("⚠️ Warning: OPENAI_API_KEY not set")
        print("   Set it with: export OPENAI_API_KEY='your-key-here'")
    
    # Load fast plant data
    plant_data = load_fast_plant_data()
    if not plant_data:
        print("❌ No plant data to populate. Please run fast_plant_database.py first.")
        return
    
    # Connect to Chroma Cloud
    client = connect_to_chroma_cloud()
    if not client:
        return
    
    # Create or get collection
    collection = create_plant_care_collection(client)
    
    # Add plants to Chroma Cloud
    if add_plants_to_chroma(collection, plant_data):
        # Test the collection
        test_collection(collection)
        
        print("\n🎉 Fast plant care database population complete!")
        print("✅ Your Smart Plant Tracker now has comprehensive plant care knowledge")
        print("📊 Database contains:")
        print(f"   - {len(plant_data)} plant care documents")
        print(f"   - Detailed care instructions for each plant")
        print(f"   - Light, watering, soil, and care requirements")
        print(f"   - Common problems and solutions")
        print(f"   - Propagation and maintenance tips")
        print(f"   - Difficulty levels and toxicity information")
    else:
        print("❌ Failed to populate plant care database")

if __name__ == "__main__":
    main()
