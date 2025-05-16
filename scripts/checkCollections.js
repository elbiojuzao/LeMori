require('dotenv').config();
const { MongoClient } = require('mongodb');

async function checkCollections() {
  let client;
  
  try {
    if (!process.env.MONGODB_URI) {
      throw new Error('MONGODB_URI não está definida no arquivo .env');
    }

    const uri = process.env.MONGODB_URI;
    client = new MongoClient(uri);
    await client.connect();
    console.log('Conectado ao MongoDB');
    
    const db = client.db();
    
    // Lista todas as coleções
    const collections = await db.listCollections().toArray();
    console.log('\nColeções encontradas:');
    collections.forEach(col => console.log(`- ${col.name}`));
    
    // Verifica a coleção de homenagens
    const homenagemCollection = collections.find(col => 
      col.name.toLowerCase() === 'homenagem' || 
      col.name.toLowerCase() === 'homenagens'
    );
    
    if (homenagemCollection) {
      console.log(`\nColeção de homenagens encontrada como: ${homenagemCollection.name}`);
      
      // Conta documentos na coleção
      const count = await db.collection(homenagemCollection.name).countDocuments();
      console.log(`Total de documentos: ${count}`);
      
      // Mostra um exemplo de documento
      const exemplo = await db.collection(homenagemCollection.name).findOne();
      console.log('\nExemplo de documento:');
      console.log(JSON.stringify(exemplo, null, 2));
    } else {
      console.log('\nColeção de homenagens não encontrada!');
    }

  } catch (error) {
    console.error('Erro:', error);
  } finally {
    if (client) {
      await client.close();
    }
    process.exit();
  }
}

checkCollections(); 