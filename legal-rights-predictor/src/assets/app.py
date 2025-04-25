from flask import Flask, request, jsonify
from flask_cors import CORS
from pymongo import MongoClient
import os
import pandas as pd
import spacy
import google.generativeai as genai
from sentence_transformers import SentenceTransformer, util
from langdetect import detect
from deep_translator import GoogleTranslator
import re
import mysql.connector
from mysql.connector import Error


# MySQL database connection settings
config = {
    'host': 'localhost',
    'user': 'root',
    'password': 'root',
    'database': 'legalrightspredictor'
}

app = Flask(__name__)
CORS(app, origins=["*"])

GEMINI_API_KEY = "YOUR_GEMINI_API_KEY"

if GEMINI_API_KEY:
    genai.configure(api_key=GEMINI_API_KEY)

import spacy.cli

try:
    nlp = spacy.load("en_core_web_sm")
except OSError:
    spacy.cli.download("en_core_web_sm")
    nlp = spacy.load("en_core_web_sm")

bert_model = SentenceTransformer("all-MiniLM-L6-v2")


def load_datasets_in_mysql():
    """Check if the dataset exists and load it into MySQL database."""
    dataset1_path = "C:/BNS 2K24 BY Dhiraj.xlsx"
    
    if not os.path.exists(dataset1_path):
        raise FileNotFoundError(f"Dataset file not found at {dataset1_path}. Please check the file path or upload the file.")
    
    df1 = pd.read_excel(dataset1_path)
    
    # Replace NaN values with None
    df1 = df1.where(pd.notnull(df1), None)
    
    
    try:
        # Establish a connection to the MySQL database
        conn = mysql.connector.connect(**config)
        cursor = conn.cursor()
        
        # Create a table if it doesn't exist
        table_name = 'BNS_DATASET'
        columns = []
        long_text_columns = ['Explanation', 'Example']  # Add columns that need LONGTEXT data type
        for col in df1.columns:
            if col in long_text_columns:
                columns.append(f"`{col}` LONGTEXT")
            else:
                columns.append(f"`{col}` VARCHAR(255)")
        columns_str = ", ".join(columns)
        cursor.execute(f"DROP TABLE IF EXISTS {table_name}")
        cursor.execute(f"CREATE TABLE {table_name} ({columns_str})")
        
        # Insert data into the MySQL table
        placeholders = ", ".join(['%s'] * len(df1.columns))
        columns_str = ", ".join([f"`{col}`" for col in df1.columns])
        for index, row in df1.iterrows():
            cursor.execute(f"INSERT INTO {table_name} ({columns_str}) VALUES ({placeholders})", tuple(row))
        
        # Commit the transaction
        conn.commit()
        
        print("Data loaded into MySQL database successfully.")
        
    except Error as e:
        print(f"Error loading data into MySQL database: {e}")
    
    finally:
        # Close the cursor and connection
        if 'cursor' in locals():
            cursor.close()
        if 'conn' in locals():
            conn.close()


            

load_datasets_in_mysql()


def load_datasets():
    """Check if the dataset exists and load it."""
    dataset1_path = "C:/BNS 2K24 BY Dhiraj.xlsx"
    if not os.path.exists(dataset1_path):
        raise FileNotFoundError(f"Dataset file not found at {dataset1_path}. Please check the file path or upload the file.")
    df1 = pd.read_excel(dataset1_path)
    return df1

def load_datasets_accused():
    """Check if the dataset exists and load it."""
    dataset2_path = "C:/past crime records by dhiraj.xlsx"
    if not os.path.exists(dataset2_path):
        raise FileNotFoundError(f"Dataset file not found at {dataset2_path}. Please check the file path or upload the file.")
    df2 = pd.read_excel(dataset2_path)
    return df2

def get_meaning_from_gemini(query):
    """Fetch query meaning using Google Gemini AI, handle API errors silently."""
    if GEMINI_API_KEY:
        # Check if an API key is provided
        try:
            model = genai.GenerativeModel("gemini-pro")
            response = model.generate_content(f"Explain and expand the meaning of: {query}")
            return response.text if response else query
        except Exception:
            return query
    else:
        return query

def preprocess_text(text):
    """Normalize text by lowercasing, lemmatizing, and handling synonyms."""
    doc = nlp(str(text).lower().strip())
    return " ".join([token.lemma_ for token in doc if not token.is_stop and not token.is_punct])

def find_relevant_sections(query, df1, threshold=0.4):
    """Find all relevant sections using BERT embeddings and semantic similarity."""
    # Get expanded meaning of the query using Gemini AI
    expanded_query = get_meaning_from_gemini(query)
    
    # Preprocess dataset text
    df1["Processed_Text"] = df1[["Title", "Explanation", "Keywords", "Synonyms of Keywords", "Condition"]].apply(lambda row: ' '.join(row.values.astype(str)), axis=1)
    
    # Compute embeddings for dataset entries
    dataset_embeddings = bert_model.encode(df1["Processed_Text"].tolist(), convert_to_tensor=True)
    
    # Compute embedding for the expanded query
    query_embedding = bert_model.encode(expanded_query, convert_to_tensor=True)
    
    # Compute cosine similarity between query and dataset entries
    similarities = util.pytorch_cos_sim(query_embedding, dataset_embeddings)[0].cpu().numpy()
    
    # Get all relevant matches above threshold
    relevant_indices = [i for i, score in enumerate(similarities) if score > threshold]
    results = []
    for idx in relevant_indices:
        result = df1.iloc[idx]
        results.append({
            "BNS Section No": result.get("BNS Section No.", "N/A"),
            "Title": result.get("Title", "N/A"),
            "Description": result.get("Explanation", "N/A"),
            "Punishment": result.get("Punishment", "N/A")
        })
    return results if results else None


def find_relevant_sections_accused(query, df1, threshold=0.4):
    """Find all relevant sections using BERT embeddings and semantic similarity."""
    # Get expanded meaning of the query using Gemini AI
    expanded_query = get_meaning_from_gemini(query)
    
    # Preprocess dataset text
    df1["Processed_Text"] = df1["Crime Description"].apply(preprocess_text)
    
    # Compute embeddings for dataset entries
    dataset_embeddings = bert_model.encode(df1["Processed_Text"].tolist(), convert_to_tensor=True)
    
    # Compute embedding for the expanded query
    query_embedding = bert_model.encode(expanded_query, convert_to_tensor=True)
    
    # Compute cosine similarity between query and dataset entries
    similarities = util.pytorch_cos_sim(query_embedding, dataset_embeddings)[0].cpu().numpy()
    
    # Get all relevant matches above threshold
    relevant_indices = [i for i, score in enumerate(similarities) if score > threshold]
    results = []
    for idx in relevant_indices:
        result = df1.iloc[idx]
        results.append({
            "Case Name": result.get("Case Name", "N/A"),
            "Crime Description": result.get("Crime Description", "N/A"),
            "Initial Punishment": result.get("Initial Punishment", "N/A"),
            "Reduced Punishment": result.get("Reduced Punishment", "N/A"),
            "Explanation": result.get("Explanation", "N/A")
        })
    return results if results else None


def chatbot(query):
    try:
        df1 = load_datasets()
        relevant_sections = find_relevant_sections(query, df1)
    except FileNotFoundError as e:
        return str(e)
    if relevant_sections:
        response = ""
        for idx, section in enumerate(relevant_sections, 1):
            response += f"<b>Possible Answer {idx}:</b><br>"
            response += f"According to BNS Section {section['BNS Section No']}<br><br>"
            response += f"<b>Title:</b> {section['Title']}<br><br>"
            response += f"<b>Description:</b> {section['Description']}<br><br>"
            response += f"<b>Punishment:</b> {section['Punishment']}<br><br>"
        return response
    else:
        return "Sorry, I couldn't find relevant information."
        

def accusedchatbot(query):
    try:
        df1 = load_datasets_accused()
        relevant_sections = find_relevant_sections_accused(query, df1)
    except FileNotFoundError as e:
        return str(e)
    if relevant_sections:
        response = ""
        for idx, section in enumerate(relevant_sections, 1):
            response += f"\nPossible Answer {idx}:\n"
            response += f"Case Name: {section['Case Name']}\n"
            response += f"Crime Description: {section['Crime Description']}\n"
            response += f"Initial Punishment: {section['Initial Punishment']}\n"
            response += f"Reduced Punishment: {section['Reduced Punishment']}\n"
            response += f"Explanation: {section['Explanation']}\n"
        return response
    else:
        return "Sorry, I couldn't find relevant information."
        
        
def chatbotMarathi(query):
    try:
        # Check if the query is only in Marathi language
        lang = detect(query)
        if lang != 'mr':
            return "कृपया फक्त मराठी भाषेत प्रश्न विचारा."

        # Translate the query to English
        translator = GoogleTranslator(source='mr', target='en')
        query_en = translator.translate(query)
        print('---')
        print(query_en)
        print('---')
        df1 = load_datasets()
        relevant_sections = find_relevant_sections(query_en, df1)
    except FileNotFoundError as e:
        return str(e)
    if relevant_sections:
        response = ""
        for idx, section in enumerate(relevant_sections, 1):
            response += f"<b>Possible Answer {idx}:</b><br>"
            response += f"According to BNS Section {section['BNS Section No']}<br><br>"
            response += f"<b>Title:</b> {section['Title']}<br><br>"
            response += f"<b>Description:</b> {section['Description']}<br><br>"
            response += f"<b>Punishment:</b> {section['Punishment']}<br><br>"  
        print('length - ')
        print(len(response))
        return response
    else:
        return "Sorry, I couldn't find relevant information."
        

def accusedchatbotMarathi(query):
    try:
        # Check if the query is only in Marathi language
        lang = detect(query)
        if lang != 'mr':
            return "कृपया फक्त मराठी भाषेत प्रश्न विचारा."

        # Translate the query to English
        translator = GoogleTranslator(source='mr', target='en')
        query_en = translator.translate(query)
        print('---')
        print(query_en)
        print('---')
        df1 = load_datasets_accused()
        relevant_sections = find_relevant_sections_accused(query_en, df1)
    except FileNotFoundError as e:
        return str(e)
    if relevant_sections:
        response = ""
        for idx, section in enumerate(relevant_sections, 1):
            response += f"\nPossible Answer {idx}:\n"
            response += f"Case Name: {section['Case Name']}\n"
            response += f"Crime Description: {section['Crime Description']}\n"
            response += f"Initial Punishment: {section['Initial Punishment']}\n"
            response += f"Reduced Punishment: {section['Reduced Punishment']}\n"
            response += f"Explanation: {section['Explanation']}\n"
        print('length - ')
        print(len(response))
        return response
    else:
        return "Sorry, I couldn't find relevant information."
        
        
def chatbotHindi(query):
    try:
        # Check if the query is only in Marathi language
        lang = detect(query)
        if lang != 'hi':
            return "कृपया प्रश्न केवल हिन्दी में ही पूछें।"

        # Translate the query to English
        translator = GoogleTranslator(source='hi', target='en')
        query_en = translator.translate(query)
        print('---')
        print(query_en)
        print('---')
        df1 = load_datasets()
        relevant_sections = find_relevant_sections(query_en, df1)
    except FileNotFoundError as e:
        return str(e)
    if relevant_sections:
        response = ""
        for idx, section in enumerate(relevant_sections, 1):
            response += f"<b>Possible Answer {idx}:</b><br>"
            response += f"According to BNS Section {section['BNS Section No']}<br><br>"
            response += f"<b>Title:</b> {section['Title']}<br><br>"
            response += f"<b>Description:</b> {section['Description']}<br><br>"
            response += f"<b>Punishment:</b> {section['Punishment']}<br><br>"  
        print('length - ')
        print(len(response))
        return response
    else:
        return "Sorry, I couldn't find relevant information."
        
        

def accusedchatbotHindi(query):
    try:
        # Check if the query is only in Marathi language
        lang = detect(query)
        if lang != 'hi':
            return "कृपया प्रश्न केवल हिन्दी में ही पूछें।"

        # Translate the query to English
        translator = GoogleTranslator(source='hi', target='en')
        query_en = translator.translate(query)
        print('---')
        print(query_en)
        print('---')
        df1 = load_datasets_accused()
        relevant_sections = find_relevant_sections_accused(query_en, df1)
    except FileNotFoundError as e:
        return str(e)
    if relevant_sections:
        response = ""
        for idx, section in enumerate(relevant_sections, 1):
            response += f"\nPossible Answer {idx}:\n"
            response += f"Case Name: {section['Case Name']}\n"
            response += f"Crime Description: {section['Crime Description']}\n"
            response += f"Initial Punishment: {section['Initial Punishment']}\n"
            response += f"Reduced Punishment: {section['Reduced Punishment']}\n"
            response += f"Explanation: {section['Explanation']}\n"
        print('length - ')
        print(len(response))
        return response
    else:
        return "Sorry, I couldn't find relevant information."
        

@app.route('/legalrightpredictor/predict', methods=['GET', 'POST', 'PUT', 'DELETE'])
def predict():
    query = request.get_json()['query']
    response = chatbot(query)
    return jsonify({'response': response})
    
@app.route('/legalrightpredictor/predict-marathi', methods=['GET', 'POST', 'PUT', 'DELETE'])
def predictMarathi():
    query = request.get_json()['query']
    response = chatbotMarathi(query)
    return jsonify({'response': response})
    

@app.route('/legalrightpredictor/predict-hindi', methods=['GET', 'POST', 'PUT', 'DELETE'])
def predictHindi():
    query = request.get_json()['query']
    response = chatbotHindi(query)
    return jsonify({'response': response})
    
@app.route('/legalrightpredictor/translate-marathi', methods=['GET', 'POST', 'PUT', 'DELETE'])
def translateMarathi():
    response = request.get_json()['query']
    print('input')
    print(response)
    print('length translate - ')
    print(len(response))
    translator = GoogleTranslator(source='auto', target='mr')
    # Split the response into possible answers
    possible_answers = re.split(r'<b>Possible Answer </b>', response)[1:]
    # Fetch only the first 3 possible answers
    first_two_answers = possible_answers[:2]
    # Join the first three answers back into a string
    first_two_answers_str = '<b>Possible Answer </b>'.join([''] + first_two_answers)
    #print('first_two_answers_str')
    #print(first_two_answers_str)
    response_mr = translator.translate(first_two_answers_str)
    print('---')
    print(response_mr)
    print(len(response_mr))
    print('---')
    return jsonify({'response': response_mr})
    
    

@app.route('/legalrightpredictor/translate-hindi', methods=['GET', 'POST', 'PUT', 'DELETE'])
def translateHindi():
    response = request.get_json()['query']
    print('input')
    print(response)
    print('length translate - ')
    print(len(response))
    translator = GoogleTranslator(source='auto', target='hi')
    # Split the response into possible answers
    possible_answers = re.split(r'<b>Possible Answer </b>', response)[1:]
    # Fetch only the first 3 possible answers
    first_two_answers = possible_answers[:2]
    # Join the first three answers back into a string
    first_two_answers_str = '<b>Possible Answer </b>'.join([''] + first_two_answers)
    #print('first_two_answers_str')
    #print(first_two_answers_str)
    response_hi = translator.translate(first_two_answers_str)
    print('---')
    print(response_hi)
    print(len(response_hi))
    print('---')
    return jsonify({'response': response_hi})


    
@app.route('/legalrightpredictor/accused-predict', methods=['GET', 'POST', 'PUT', 'DELETE'])
def accusedpredict():
    query = request.get_json()['query']
    response = accusedchatbot(query)
    return jsonify({'response': response})
    
@app.route('/legalrightpredictor/accused-predict-marathi', methods=['GET', 'POST', 'PUT', 'DELETE'])
def accusedpredictMarathi():
    query = request.get_json()['query']
    response = accusedchatbotMarathi(query)
    return jsonify({'response': response})
    

@app.route('/legalrightpredictor/accused-predict-hindi', methods=['GET', 'POST', 'PUT', 'DELETE'])
def accusedpredictHindi():
    query = request.get_json()['query']
    response = accusedchatbotHindi(query)
    return jsonify({'response': response})
    
@app.route('/legalrightpredictor/accused-translate-marathi', methods=['GET', 'POST', 'PUT', 'DELETE'])
def accusedtranslateMarathi():
    response = request.get_json()['query']
    print('input')
    print(response)
    print('length translate - ')
    print(len(response))
    translator = GoogleTranslator(source='auto', target='mr')
    # Split the response into possible answers
    possible_answers = re.split(r'<b>Possible Answer </b>', response)[1:]
    # Fetch only the first 3 possible answers
    first_two_answers = possible_answers[:2]
    # Join the first three answers back into a string
    first_two_answers_str = '<b>Possible Answer </b>'.join([''] + first_two_answers)
    #print('first_two_answers_str')
    #print(first_two_answers_str)
    response_mr = translator.translate(first_two_answers_str)
    print('---')
    print(response_mr)
    print(len(response_mr))
    print('---')
    return jsonify({'response': response_mr})
    
    
@app.route('/legalrightpredictor/accused-translate-hindi', methods=['GET', 'POST', 'PUT', 'DELETE'])
def accusedtranslateHindi():
    response = request.get_json()['query']
    print('input')
    print(response)
    print('length translate - ')
    print(len(response))
    translator = GoogleTranslator(source='auto', target='hi')
    # Split the response into possible answers
    possible_answers = re.split(r'<b>Possible Answer </b>', response)[1:]
    # Fetch only the first 3 possible answers
    first_two_answers = possible_answers[:2]
    # Join the first three answers back into a string
    first_two_answers_str = '<b>Possible Answer </b>'.join([''] + first_two_answers)
    #print('first_two_answers_str')
    #print(first_two_answers_str)
    response_hi = translator.translate(first_two_answers_str)
    print('---')
    print(response_hi)
    print(len(response_hi))
    print('---')
    return jsonify({'response': response_hi})
    
    
@app.route('/legalrightpredictor/save-chat', methods=['POST'])
def savechat():
    try:
        data = request.get_json()
        if 'messages' not in data:
            return jsonify({'error': 'Missing messages key'}), 400
        messages = data['messages']
        # Remove HTML tags
        clean_messages = re.sub('<.*?>', '', messages)
        # Connect to the database
        client = MongoClient("mongodb://localhost:27017/")
        db = client["legalrightpredictor"]
        collection = db["legalrightpredictor-collection"]
        
        # Insert data into the collection
        collection.insert_one({'messages': clean_messages})
        
        # Close the client
        client.close()
        
        return jsonify({'response': 'Saved to MongoDB'}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# Signup API endpoint
@app.route('/signup', methods=['POST'])
def signup():
    try:
        # Get request data
        data = request.json
        firstName = data['firstName']
        lastName = data['lastName']
        email = data['email']
        pwd = data['pwd']
        gender = data['gender']

        # Map gender to enum value
        if gender.lower() == 'male':
            gender = 'Male'
        elif gender.lower() == 'female':
            gender = 'Female'
        else:
            gender = 'Other'

        # Connect to MySQL database
        conn = mysql.connector.connect(**config)
        cursor = conn.cursor()

        # Check if email already exists
        query = "SELECT * FROM signup WHERE email = %s"
        cursor.execute(query, (email,))
        if cursor.fetchone():
            return jsonify({'message': 'Email already exists'}), 400

        # Insert new user into database
        query = "INSERT INTO signup (firstName, lastName, email, pwd, gender) VALUES (%s, %s, %s, %s, %s)"
        cursor.execute(query, (firstName, lastName, email, pwd, gender))
        conn.commit()

        # Close database connection
        cursor.close()
        conn.close()

        return jsonify({'message': 'User created successfully'}), 201

    except Error as e:
        return jsonify({'error': str(e)}), 500
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/login', methods=['POST'])
def login():
    try:
        # Get request data
        data = request.json
        email = data['username']
        pwd = data['password']

        # Connect to MySQL database
        conn = mysql.connector.connect(**config)
        cursor = conn.cursor()

        # Check if email and password are valid
        query = "SELECT * FROM signup WHERE email = %s AND pwd = %s"
        cursor.execute(query, (email, pwd))
        user = cursor.fetchone()

        if user:
            return jsonify({'message': 'Logged in successfully'}), 200
        else:
            return jsonify({'message': 'Invalid email or password'}), 401

    except Error as e:
        return jsonify({'error': str(e)}), 500

    finally:
        # Close database connection
        if 'cursor' in locals():
            cursor.close()
        if 'conn' in locals():
            conn.close()
            
          
@app.route('/update-pwd', methods=['POST'])
def forgot_pwd():
    try:
        # Get request data
        data = request.json
        email = data['email']
        new_pwd = data['new_pwd']

        # Connect to MySQL database
        conn = mysql.connector.connect(**config)
        cursor = conn.cursor()

        # Check if email exists
        query = "SELECT * FROM signup WHERE email = %s"
        cursor.execute(query, (email,))
        user = cursor.fetchone()

        if user:
            # Update password
            query = "UPDATE signup SET pwd = %s WHERE email = %s"
            cursor.execute(query, (new_pwd, email))
            conn.commit()
            return jsonify({'message': 'Password updated successfully'}), 200
        else:
            return jsonify({'message': 'Invalid email'}), 401

    except Error as e:
        return jsonify({'error': str(e)}), 500

    finally:
        # Close database connection
        if 'cursor' in locals():
            cursor.close()
        if 'conn' in locals():
            conn.close()


if __name__ == "__main__":
    app.run(port=8081)