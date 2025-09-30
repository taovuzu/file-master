<a name="readme-top"></a>

[![Forks][forks-shield]][forks-url] [![Stargazers][stars-shield]][stars-url] [![Issues][issues-shield]][issues-url] [![MIT License][license-shield]][license-url] [![LinkedIn][linkedin-shield]][linkedin-url]



[forks-shield]: https://img.shields.io/github/forks/taovuzu/file-master.svg?style=for-the-badge
[forks-url]: https://github.com/taovuzu/file-master/network/members
[stars-shield]: https://img.shields.io/github/stars/taovuzu/file-master.svg?style=for-the-badge
[stars-url]: https://github.com/taovuzu/file-master/stargazers
[issues-shield]: https://img.shields.io/github/issues/taovuzu/file-master.svg?style=for-the-badge
[issues-url]: https://github.com/taovuzu/file-master/issues
[license-shield]: https://img.shields.io/github/license/taovuzu/file-master.svg?style=for-the-badge
[license-url]: https://github.com/taovuzu/file-master/blob/main/LICENSE
[linkedin-shield]: https://img.shields.io/badge/LinkedIn-0077B5?style=for-the-badge&logo=linkedin&logoColor=white
[linkedin-url]: https://www.linkedin.com/in/krishna-chahar/



<br />
<div align="center">
<table>
  <tr>
    <td width="90">
      <a href="https://github.com/taovuzu/file-master">
        <img src="https://raw.githubusercontent.com/lucide-icons/lucide/main/icons/file-text.svg" alt="Logo" width="80" height="80">
      </a>
    </td>
    <td valign="middle">
      <a href="https://github.com/taovuzu/file-master" style="text-decoration: none; color: inherit;">
        <h1 style="margin: 0; border: 0; font-size: 28px;">FileMaster</h1>
      </a>
      <p style="margin: 0; font-size: 14px;">
        PDF Tools
      </p>
    </td>
  </tr>
</table>

  <h3 align="center">FileMaster PDF Tools</h3>

  <p align="center">
    A comprehensive PDF manipulation platform that provides all essential PDF processing tools online. From basic operations like merging and splitting to advanced features like watermarking and password protection, FileMaster offers a complete solution for all your PDF needs.
    <br />
    <a href="DOCUMENTATION.md"><strong>Explore the docs »</strong></a>
    <br />
    <br />
    <a href="https://youtu.be/XMpiShj4NlA">View Demo</a>
    ·
    <a href="https://github.com/taovuzu/file-master/issues">Report Bug</a>
    ·
    <a href="https://github.com/taovuzu/file-master/issues">Request Feature</a>
  </p>
</div>



<details>
  <summary>Table of Contents</summary>
  <ol>
    <li>
      <a href="#about-the-project">About The Project</a>
      <ul>
        <li><a href="#built-with">Built With</a></li>
      </ul>
    </li>
    <li><a href="#features">Features</a></li>
    <li>
      <a href="#getting-started">Getting Started</a>
      <ul>
        <li><a href="#prerequisites">Prerequisites</a></li>
        <li><a href="#installation">Installation</a></li>
      </ul>
    </li>
    <li><a href="#usage">Usage</a></li>
    <li><a href="#technical-details">Technical Details</a></li>
    <li><a href="#future-plans">Future Plans</a></li>
    <li><a href="#contributing">Contributing</a></li>
    <li><a href="#license">License</a></li>
    <li><a href="#contact">Contact</a></li>
    <li><a href="#acknowledgments">Acknowledgments</a></li>
  </ol>
</details>



## About The Project

<!-- [![Product Name Screen Shot][product-screenshot]](https://example.com) -->

FileMaster PDF Tools is a modern, full-stack web application designed to provide comprehensive PDF manipulation capabilities through an intuitive web interface. Built with cutting-edge technologies, it offers a complete suite of PDF processing tools that cater to both individual users and businesses.

The platform features a microservices architecture with separate client and server components, ensuring scalability and maintainability. The application supports real-time file processing, secure user authentication, and provides a seamless user experience across all devices.

Key highlights of the platform include:
- **Secure Processing**: All files are processed securely and automatically deleted after completion
- **High Performance**: Optimized cloud infrastructure ensures fast processing times
- **User-Friendly Interface**: Modern, responsive design with intuitive navigation
- **Comprehensive Toolset**: Covers all essential PDF operations from basic to advanced features

<p align="right">(<a href="#readme-top">back to top</a>)</p>



### Built With

This section lists the major frameworks and libraries used to build the project.

 [![React][React.js]][React-url] [![Node.js][Node.js]][Node-url] [![Express][Express.js]][Express-url] [![MongoDB][MongoDB]][MongoDB-url] [![Redis][Redis]][Redis-url] [![Docker][Docker]][Docker-url] [![AWS S3][AWS S3]][AWS S3-url] [![Ant Design][Ant Design]][Ant Design-url]

<p align="right">(<a href="#readme-top">back to top</a>)</p>

## Features

* **PDF Merging** - Combine multiple PDF files into a single document
* **PDF Splitting** - Split PDFs by pages or custom ranges
* **PDF Compression** - Reduce file size while maintaining quality
* **PDF Conversion** - Convert various formats (DOCX, PPTX, images) to PDF and vice-versa
* **PDF Protection** - Add password protection and encryption
* **PDF Unlocking** - Remove password protection from PDFs
* **PDF Rotation** - Rotate pages by 90, 180, or 270 degrees
* **Watermarking** - Add text or image watermarks to PDFs
* **Page Numbering** - Add page numbers with custom formatting
* **User Authentication** - Secure login with email/password and Google OAuth
* **File Preview** - Preview PDFs before processing
* **Batch Processing** - Process multiple files simultaneously
* **Real-time Progress** - Track processing status in real-time
* **Secure File Handling** - Automatic file cleanup after processing
* **Responsive Design** - Works seamlessly on desktop and mobile devices

<p align="right">(<a href="#readme-top">back to top</a>)</p>


## Getting Started

### Prerequisites

The following prerequisites must be met before proceeding with the installation. Note that an **AWS S3 account** is a mandatory requirement for both installation methods to facilitate file storage.

#### For Docker (Recommended)
* **Docker & Docker Compose**: Ensure both are correctly installed and the Docker daemon is active.

#### For Manual Installation
* **Node.js**: Version 20 or a higher version is required.
* **MongoDB**: A running instance of MongoDB, accessible from the local machine.
* **Redis**: A running instance of Redis.
* **LibreOffice**: Required for document conversion functionalities.
    * **Ubuntu/Debian**: Execute `sudo apt-get install libreoffice`
    * **macOS (via Homebrew)**: Execute `brew install --cask libreoffice`
    * **Windows**: Download the installer from the [official website](https://www.libreoffice.org/download/download-libreoffice/).
* **qpdf**: Required for core PDF manipulation tasks.
    * **Ubuntu/Debian**: Execute `sudo apt-get install qpdf`
    * **macOS (via Homebrew)**: Execute `brew install qpdf`
    * **Windows**: Install using a package manager such as Chocolatey (`choco install qpdf`) or obtain it from the [official source repository](https://github.com/qpdf/qpdf/releases).

---

## Installation


## Using Docker (Recommended)

This method is recommended for its simplicity and consistent environment setup.

1.  **Clone the Repository**
    ```bash
    git clone [https://github.com/taovuzu/file-master.git](https://github.com/taovuzu/file-master.git)
    cd file-master
    ```

2.  **Create Environment Files**
    ```bash
    # Copy the templates for the client, server, and Docker Compose
    cp client/.env.example client/.env
    cp server/.env.example server/.env
    cp .env.example .env
    ```

3.  **Configure Environment Variables**
    * Open the newly created `.env`, `client/.env`, and `server/.env` files.
    * Populate the files with the necessary credentials and configuration values, particularly for the **AWS S3 account**. The database and Redis variables in the root `.env` file are utilized by Docker Compose to provision the respective services.

5. Build and run the Docker containers
   ```bash
   docker compose up --build
   ```

5.  **Accessing the Application**
    * The application will be accessible at `http://localhost:5173`.

## Manual Installation

1.  **Start Dependent Services**
    * Ensure that your local instances of **MongoDB** and **Redis** are running before proceeding.

2.  **Clone the Repository**
    ```bash
    git clone [https://github.com/taovuzu/file-master.git](https://github.com/taovuzu/file-master.git)
    cd file-master
    ```

3.  **Set Up Environment Variables**
    ```bash
    # Copy the environment templates for the client and server
    cp client/.env.example client/.env
    cp server/.env.example server/.env
    cp .env.example .env
    ```
    * Open `client/.env` and `server/.env` to apply your configuration.
    * **Important**: In `server/.env`, the `MONGO_URI` and `REDIS_URL` variables must be updated to point to your running local services. AWS S3 credentials must also be provided.

4.  **Install Project Dependencies**
    ```bash
    # Install server-side dependencies
    cd server
    npm install
    
    # Install client-side dependencies from the project root in a new terminal
    cd ../client
    npm install
    ```

5.  **Run the Application**
    * Three separate terminal sessions are required to run the application components.
    ```bash
    # In Terminal 1 (from the /server directory): Start the API server
    npm run dev:server
    
    # In Terminal 2 (from the /server directory): Start the background worker
    npm run dev:worker
    
    # In Terminal 3 (from the /client directory): Start the frontend client
    npm run dev
    ```

6.  **Accessing the Application**
    * The application will be accessible at `http://localhost:5173`.
## Usage

FileMaster PDF Tools provides an intuitive web interface for all PDF operations. Here's how to use the platform:

1. **Choose Tool**: Select the desired PDF operation from the available tools
2. **Upload Files**: Drag and drop PDF files or click to browse and select files
3. **Configure Options**: Set specific parameters for the operation (compression level, page ranges, etc.)
4. **Process**: Click the process button to start the operation
5. **Download**: Once processing is complete, download the result

<details>
<summary> Example Workflows </summary>

**Merging PDFs:**
- Upload multiple PDF files
- Select "Merge PDF" tool
- Arrange files in desired order
- Click "Merge" to combine files

**Compressing PDFs:**
- Upload a PDF file
- Select "Compress PDF" tool
- Choose compression level (Low, Medium, High)
- Click "Compress" to reduce file size

**Adding Watermarks:**
- Upload a PDF file
- Select "Watermark PDF" tool
- Enter watermark text or upload image
- Configure position, transparency, and rotation
- Click "Add Watermark" to process

</details>

<p align="right">(<a href="#readme-top">back to top</a>)</p>

## Technical Details

<details>
<summary>Architecture Overview</summary>

FileMaster follows a microservices architecture with the following components:

- **Client Application**: React-based frontend with Vite build system
- **API Server**: Express.js REST API with JWT authentication
- **Worker Service**: Background job processor for PDF operations
- **Database**: MongoDB for user data and job management
- **Cache**: Redis for job queues and rate-limiting and others
- **Storage**: AWS S3 for file storage for processing and downloading

**Security Architecture:**
The application uses containerized microservices with strict isolation between the API server and worker processes. This separation provides enhanced security by:
- **Process Isolation**: Worker containers run with limited permissions and restricted access
- **Fault Containment**: If a worker crashes or executes malicious code, it cannot affect the main server
- **Resource Isolation**: Each container has its own filesystem, network, and process space
- **Minimal Attack Surface**: Workers only have access to necessary resources for PDF processing

</details>

<details>
<summary>Technology Stack</summary>

**Frontend:**
- React 19.1.0 with functional components and hooks
- Redux Toolkit for state management
- Ant Design for UI components
- React Router for navigation
- PDF.js for PDF preview functionality
- Vite for build tooling and development server

**Backend:**
- Node.js 20 with Express.js framework
- MongoDB with Mongoose ODM
- Redis with BullMQ for job queues
- JWT for authentication
- Passport.js for OAuth integration
- AWS SDK for S3 integration

**PDF Processing:**
- pdf-lib for PDF manipulation
- LibreOffice for document conversion
- QPDF for PDF operations
- Poppler utilities for PDF processing

**Infrastructure:**
- Docker for containerization
- Docker Compose for orchestration
- Nginx for reverse proxy
- AWS S3 for file storage

</details>

<details>
<summary>Database Schema</summary>

**User Model:**
- email: String (unique, required)
- fullName: String (required)
- password: String (hashed with bcrypt)
- loginType: Array (email, google)
- refreshToken: String
- createdAt: Date
- updatedAt: Date

**Job Model:**
- jobId: String (unique)
- userId: ObjectId (reference to User)
- operation: String (merge, split, compress, etc.)
- status: String (pending, processing, completed, failed)
- progress: Number (0-100)
- inputFiles: Array of S3 keys
- outputFile: String (S3 key)
- createdAt: Date
- updatedAt: Date

</details>

<details>
<summary>API Endpoints</summary>

**Authentication:**
- POST /api/v1/users/register-email - Register with email
- POST /api/v1/users/register-user - Complete registration
- GET /api/v1/users/verify-email-link - Verify email by link
- POST /api/v1/users/verify-email-otp - Verify email by OTP
- POST /api/v1/users/login - User login
- POST /api/v1/users/resend-verification - Resend email verification
- POST /api/v1/users/request-password-reset - Request password reset
- POST /api/v1/users/reset-forgot-password - Reset forgotten password
- POST /api/v1/users/logout - User logout
- POST /api/v1/users/change-password - Change current password
- GET /api/v1/users/current-user - Get current user
- GET /api/v1/users/refresh-access-token - Refresh access token
- GET /api/v1/users/google - Google OAuth login
- GET /api/v1/users/google/callback - Google OAuth callback

**PDF Operations:**
- POST /api/v1/pdf-tools/compress - Compress PDF
- POST /api/v1/pdf-tools/merge - Merge PDFs
- POST /api/v1/pdf-tools/split - Split PDF
- POST /api/v1/pdf-tools/rotate - Rotate PDF
- POST /api/v1/pdf-tools/protect - Protect PDF
- POST /api/v1/pdf-tools/unlock - Unlock PDF
- POST /api/v1/pdf-tools/watermark/text - Add text watermark
- POST /api/v1/pdf-tools/page-numbers - Add page numbers
- POST /api/v1/pdf-tools/convert/doc-to-pdf - Convert document to PDF
- POST /api/v1/pdf-tools/convert/images-to-pdf - Convert images to PDF
- POST /api/v1/pdf-tools/convert/pdf-to-doc - Convert PDF to document
- POST /api/v1/pdf-tools/convert/pdf-to-ppt - Convert PDF to PowerPoint

**File Management:**
- POST /api/v1/upload/presign - Get presigned URL for file upload
- GET /api/v1/download/status/:jobId - Check job status
- GET /api/v1/download/:jobId - Download processed files

**Health Check:**
- GET /api/v1/health - General health check
- GET /api/v1/health/redis - Redis health check
- GET /api/v1/health/mongodb - MongoDB health check

</details>

<details>
<summary>Processing Flow</summary>

1. **File Upload**: User uploads files through the web interface
2. **Validation**: Files are validated for type, size, and security and abuse prevention
3. **S3 Storage**: Files are uploaded to AWS S3 with unique keys
4. **Job Creation**: A processing job is created and added to Redis queue
5. **Worker Processing**: Background worker picks up the job and processes files and real-time progress is updated in cache
6. **Progress Updates**: Client polls the server for real-time progress
7. **Result Storage**: Processed files are stored in S3
8. **Download**: User can download the processed files
9. **Cleanup**: Temporary files are automatically deleted

</details>

<details>
<summary>Security Features</summary>

- **JWT Authentication**: Secure token-based authentication
- **CSRF Protection**: Cross-site request forgery protection
- **Rate Limiting**: API rate limiting to prevent abuse
- **File Validation**: Comprehensive file type and size validation
- **Secure File Storage**: Files stored securely in AWS S3
- **Automatic Cleanup**: Files are automatically deleted after processing
- **Input Sanitization**: All user inputs are sanitized and validated
- **Container Isolation**: Separate worker and server containers with limited permissions
- **Fault Containment**: Worker crashes or malicious code execution cannot affect the main server
- **Process Isolation**: Each container runs with restricted access and minimal attack surface

</details>

<details>
<summary>Performance Optimizations</summary>

**Currently Implemented:**
- **Background Processing**: PDF operations run in isolated background workers
- **Redis Caching**: Job data and usage metrics cached in Redis
- **Rate Limiting**: Multi-tier rate limiting (global slowdown, sensitive endpoints, upload limits)
- **Queue Management**: BullMQ job queue with retry mechanisms and job reservation system
- **Secure Process Spawning**: Isolated PDF processing with QPDF and LibreOffice
- **Progress Tracking**: Real-time job status updates with detailed progress reporting
- **Resource Cleanup**: Automatic temporary file cleanup after processing
- **Usage Limits**: Per-user and anonymous usage tracking with daily limits
- **S3 Streaming**: Stream-based file upload/download for large files

**Planned Optimizations:**
- **Stream Processing**: Convert all processors to stream data instead of file downloads
- **Enhanced S3 Validation**: Implement better S3 stream-based file validation
- **Response Compression**: Add gzip compression for API responses
- **Connection Pooling**: Implement database connection pooling
- **CDN Integration**: Serve static assets through CDN

</details>

<p align="right">(<a href="#readme-top">back to top</a>)</p>

## Future Plans

**Performance Enhancements**
- Implement streaming data processing to replace file-based operations
- Add comprehensive S3 stream validation for enhanced security
- Integrate response compression and connection pooling

**Business Features**
- Develop payment integration for premium services
- Create subscription-based usage tiers
- Implement advanced analytics and reporting

**Infrastructure & Security**
- Deploy to production environment with full monitoring
- Enhance security measures and vulnerability assessments
- Implement comprehensive logging and audit trails

**Development**
- Expand API documentation and developer resources
- Create comprehensive testing suite
- Establish CI/CD pipeline for automated deployments

For detailed feature requests and bug reports, visit our [GitHub Issues](https://github.com/taovuzu/file-master/issues).

<p align="right">(<a href="#readme-top">back to top</a>)</p>

## Contributing

Contributions are what make the open source community such an amazing place to learn, inspire, and create. Any contributions you make are greatly appreciated.

If you have a suggestion that would make this better, please fork the repo and create a pull request. You can also simply open an issue with the tag "enhancement".
Don't forget to give the project a star! Thanks again!

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

<p align="right">(<a href="#readme-top">back to top</a>)</p>

## License

Distributed under the MIT License. See `LICENSE` for more information.

<p align="right">(<a href="#readme-top">back to top</a>)</p>

## Contact

taovuzu - [@taovuzu](https://github.com/taovuzu) - chaharkrishna937@gmail.com

Project Link: [https://github.com/taovuzu/file-master](https://github.com/taovuzu/file-master)

<p align="right">(<a href="#readme-top">back to top</a>)</p>

<details>
<summary>Acknowledgments</summary>

We extend our gratitude to the open-source projects and their maintainers that make this application possible:

**Core Technologies**
- [React](https://reactjs.org/) - Frontend framework
- [Node.js](https://nodejs.org/) - Backend runtime
- [Express.js](https://expressjs.com/) - Web framework
- [MongoDB](https://www.mongodb.com/) - Database
- [Redis](https://redis.io/) - Caching

**PDF Processing**
- [PDF-lib](https://pdf-lib.js.org/) - PDF manipulation
- [QPDF](https://qpdf.sourceforge.io/) - PDF toolkit
- [LibreOffice](https://www.libreoffice.org/) - Document conversion
- [Poppler](https://poppler.freedesktop.org/) - PDF utilities

**Infrastructure**
- [AWS S3](https://aws.amazon.com/s3/) - Cloud storage
- [Docker](https://www.docker.com/) - Containerization
- [BullMQ](https://bullmq.io/) - Job queue
- [Ant Design](https://ant.design/) - UI components

</details>

<p align="right">(<a href="#readme-top">back to top</a>)</p>



<!-- MARKDOWN LINKS & IMAGES -->
<!-- https://www.markdownguide.org/basic-syntax/#reference-style-links -->
[contributors-shield]: https://img.shields.io/github/contributors/taovuzu/file-master.svg?style=for-the-badge
[contributors-url]: https://github.com/taovuzu/file-master/graphs/contributors
[forks-shield]: https://img.shields.io/github/forks/taovuzu/file-master.svg?style=for-the-badge
[forks-url]: https://github.com/taovuzu/file-master/network/members
[stars-shield]: https://img.shields.io/github/stars/taovuzu/file-master.svg?style=for-the-badge
[stars-url]: https://github.com/taovuzu/file-master/stargazers
[issues-shield]: https://img.shields.io/github/issues/taovuzu/file-master.svg?style=for-the-badge
[issues-url]: https://github.com/taovuzu/file-master/issues
[license-shield]: https://img.shields.io/github/license/taovuzu/file-master.svg?style=for-the-badge
[license-url]: https://github.com/taovuzu/file-master/blob/main/LICENSE
[linkedin-shield]: https://img.shields.io/badge/LinkedIn-0077B5?style=for-the-badge&logo=linkedin&logoColor=white
[linkedin-url]: https://www.linkedin.com/in/krishna-chahar/
[product-screenshot]: images/screenshot.png

[React.js]: https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB
[React-url]: https://reactjs.org/
[Node.js]: https://img.shields.io/badge/Node.js-43853D?style=for-the-badge&logo=node.js&logoColor=white
[Node-url]: https://nodejs.org/
[Express.js]: https://img.shields.io/badge/Express.js-404D59?style=for-the-badge
[Express-url]: https://expressjs.com/
[MongoDB]: https://img.shields.io/badge/MongoDB-4EA94B?style=for-the-badge&logo=mongodb&logoColor=white
[MongoDB-url]: https://www.mongodb.com/
[Redis]: https://img.shields.io/badge/Redis-DC382D?style=for-the-badge&logo=redis&logoColor=white
[Redis-url]: https://redis.io/
[Docker]: https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white
[Docker-url]: https://www.docker.com/
[AWS S3]: https://img.shields.io/badge/AWS_S3-FF9900?style=for-the-badge&logo=amazon-aws&logoColor=white
[AWS S3-url]: https://aws.amazon.com/s3/
[Ant Design]: https://img.shields.io/badge/Ant_Design-0170FE?style=for-the-badge&logo=ant-design&logoColor=white
[Ant Design-url]: https://ant.design/
