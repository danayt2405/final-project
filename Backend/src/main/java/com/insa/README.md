# INSA Complaints Backend (Full)

This project skeleton implements:
- JWT auth
- user_type_access-based admin access (no assignedType field required)
- complaint submit (JSON & multipart with attachments)
- admin report endpoint (summary by status)
- local file storage for attachments

Configuration:
- Update src/main/resources/application.properties with your DB credentials and jwt secret.
- Build with Maven and run.
