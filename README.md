# NaverDictionary Scraper (in Typescript)

![Docker Pulls](https://img.shields.io/docker/pulls/sadlyharry/naverdictionarytypescript)

This repository contains the source code for the NaverDictionary microservice, which scrapes the Naver Korean-English Dictionary and provides a REST API for retrieving Korean word information, including translations and additional metadata. This service can be easily deployed via Docker.

## Quick Start

To run the NaverDictionary service, follow these steps:

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/naverdictionarytypescript.git
cd naverdictionarytypescript
```

### 2. Build the Docker Image

If you prefer to build the Docker image from source, run the following command:

```bash
docker build -t naverdictionarytypescript .
```

### 3. Run the Docker Container

To run the service using Docker, execute the following command:

```bash
docker run -p 8080:8080 naverdictionarytypescript:latest
```

This will start the REST server at port 8080. If you'd prefer, you can directly download and test the pre-built Docker image available on Docker Hub:

```bash
docker run -p 8080:8080 sadlyharry/naverdictionarytypescript:latest
```

## API Endpoints

The NaverDictionary microservice exposes several endpoints that you can use to interact with the dictionary data:

### 1. **Get Word Information**

Retrieve detailed information about a Korean word.

- **Endpoint:** `<hostname>/get?word=<korean_word>`
- **Example Request:** `127.0.0.1/get?word=사랑`
- **Example Response:**
  ```json
  {
      "Topik": "TOPIK Elementary",
      "Importance": "★★★",
      "Title": "사랑",
      "Hanja": "愛",
      "Endef": "love",
      "Pronun": "sa-rang",
      "PartSpeech": "noun",
      "Meanings": "Deep affection for someone or something."
  }
  ```
- **Description of Fields:**
  - **Topik:** Indicates if the word appears in the TOPIK (Test of Proficiency in Korean) exams.
  - **Importance:** Represents the popularity of the word, rated out of three stars.
  - **Title:** The Korean word itself.
  - **Hanja:** The Chinese character equivalent of the word, if applicable.
  - **Endef:** The English translation of the word.
  - **Pronun:** Pronunciation guide in both English and Korean.
  - **PartSpeech:** Grammatical category (e.g., noun, verb).
  - **Meanings:** Detailed descriptions and meanings of the word.

### 2. **Get Raw Entry Information**

Access the raw entry data scraped from the Naver dictionary.

- **Endpoint:** `<hostname>/get/entryinfo?word=<korean_word>`
- **Example Request:** `127.0.0.1/get/entryinfo?word=사랑`
- **Description:** Provides the unprocessed data retrieved directly from the Naver dictionary for advanced processing.

### 3. **Get Raw Search Information**

Obtain the raw search data from the Naver dictionary.

- **Endpoint:** `<hostname>/get/searchinfo?word=<korean_word>`
- **Example Request:** `127.0.0.1/get/searchinfo?word=사랑`
- **Description:** Returns the raw search data from Naver for the specified word.

### 4. **Get Formatted Message**

Retrieve a formatted message suitable for chatbot integration or frontend display.

- **Endpoint:** `<hostname>/get/message?word=<korean_word>`
- **Example Request:** `127.0.0.1/get/message?word=사랑`
- **Description:** Provides a user-friendly message with key information about the word, ideal for chatbot responses or UI displays.

## Error Handling

In case of an error, the API will respond with a JSON object containing an error message.

- **Example Response:**
  
```json
  {
    "error": ...
  }
```

## License

This project is licensed under the MIT License.

## Docker Image

If you prefer not to build the Docker image from source, you can download and test the pre-built Docker image on Docker Hub:

```bash
docker pull sadlyharry/naverdictionarytypescript:latest
```

For more information or to contribute, visit the [GitHub repository](https://github.com/yourusername/naverdictionarytypescript).
