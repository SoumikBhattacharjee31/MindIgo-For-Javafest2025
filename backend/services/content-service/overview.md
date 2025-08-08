Absolutely. Here's a **comprehensive API design overview** for the `content_service`, covering all core functionality — **endpoints, models, and relationships** — with **clear grouping by feature**.

---

## 🧠 **Overview**

Your `content_service` will handle:

1. **Course Management** (by experts)
2. **Course Consumption** (by users)
3. **Feedback Collection**
4. **Subscription & Package Management**
5. **Custom Course Assignment**
6. **Content Discovery & AI Integration (Optional)**

---

## 📦 **Main Data Models (Overview)**

### 1. `Course`

```json
{
  "id": "UUID",
  "title": "String",
  "description": "String",
  "expertId": "UUID",
  "isCustom": "Boolean",
  "targetUserId": "UUID | null",
  "packageId": "UUID",
  "durationDays": "Integer",
  "createdAt": "Timestamp"
}
```

### 2. `CourseDay`

```json
{
  "id": "UUID",
  "courseId": "UUID",
  "dayNumber": "Integer",
  "title": "String",
  "description": "String"
}
```

### 3. `Task`

```json
{
  "id": "UUID",
  "dayId": "UUID",
  "type": "video | meditation | reflection | quiz | exercise",
  "title": "String",
  "contentUrl": "String | null",
  "instructions": "String"
}
```

### 4. `Feedback`

```json
{
  "id": "UUID",
  "userId": "UUID",
  "courseId": "UUID",
  "dayId": "UUID",
  "taskId": "UUID | null",
  "question": "String",
  "answer": "String",
  "submittedAt": "Timestamp"
}
```

### 5. `Package`

```json
{
  "id": "UUID",
  "name": "String",
  "description": "String",
  "price": "Decimal",
  "isFree": "Boolean",
  "durationDays": "Integer"
}
```

### 6. `Subscription`

```json
{
  "id": "UUID",
  "userId": "UUID",
  "packageId": "UUID",
  "startDate": "Date",
  "endDate": "Date",
  "isActive": "Boolean"
}
```

---

## 🛠️ **API Endpoints (Grouped)**

---

### 🔧 Course Management (For Experts)

| Method   | Endpoint                           | Description                                   |
| -------- | ---------------------------------- | --------------------------------------------- |
| `POST`   | `/api/courses`                     | Create a new course                           |
| `PUT`    | `/api/courses/{courseId}`          | Update course details                         |
| `DELETE` | `/api/courses/{courseId}`          | Delete course                                 |
| `POST`   | `/api/courses/{courseId}/days`     | Add a day to course                           |
| `POST`   | `/api/courses/{dayId}/tasks`       | Add task(s) to a day                          |
| `GET`    | `/api/courses/expert/{expertId}`   | List courses by expert                        |
| `GET`    | `/api/courses/{courseId}/feedback` | View feedback per course (for expert insight) |

---

### 📚 Course Discovery & Enrollment (For Users)

| Method | Endpoint                                   | Description                                        |
| ------ | ------------------------------------------ | -------------------------------------------------- |
| `GET`  | `/api/courses`                             | List all available courses (based on subscription) |
| `GET`  | `/api/courses/{courseId}`                  | Get full course details                            |
| `GET`  | `/api/courses/{courseId}/days/{dayNumber}` | Get tasks for a specific day                       |
| `GET`  | `/api/courses/active/user/{userId}`        | Get all courses currently active for the user      |

---

### 📝 Feedback (Per Day or Per Task)

| Method | Endpoint                           | Description                         |
| ------ | ---------------------------------- | ----------------------------------- |
| `POST` | `/api/feedbacks`                   | Submit feedback (day or task level) |
| `GET`  | `/api/feedbacks/user/{userId}`     | Retrieve all feedbacks for a user   |
| `GET`  | `/api/feedbacks/course/{courseId}` | Retrieve feedbacks per course       |
| `GET`  | `/api/feedbacks/task/{taskId}`     | Feedback for specific task          |

---

### 💳 Subscription & Package Management

| Method | Endpoint                           | Description                    |
| ------ | ---------------------------------- | ------------------------------ |
| `GET`  | `/api/packages`                    | Get all available packages     |
| `POST` | `/api/packages`                    | Admin: create new package      |
| `PUT`  | `/api/packages/{packageId}`        | Admin: update package          |
| `POST` | `/api/subscriptions`               | Subscribe to a package         |
| `GET`  | `/api/subscriptions/user/{userId}` | Get user's subscription status |

---

### 🎯 Custom Course Assignment

| Method | Endpoint                                | Description                             |
| ------ | --------------------------------------- | --------------------------------------- |
| `POST` | `/api/custom-courses`                   | Expert creates custom course for a user |
| `GET`  | `/api/custom-courses/user/{userId}`     | User gets all custom courses            |
| `GET`  | `/api/custom-courses/expert/{expertId}` | Expert views custom courses created     |

---

### 🤖 (Optional) AI-Driven Suggestions

| Method | Endpoint                        | Description                                            |
| ------ | ------------------------------- | ------------------------------------------------------ |
| `POST` | `/api/ai/recommend-course`      | Request AI to suggest a course (based on user history) |
| `GET`  | `/api/ai/summary/user/{userId}` | Get AI summary of feedbacks or progress                |

---

## 🔐 Role-Based Access Summary

| Role     | Permissions                                                    |
| -------- | -------------------------------------------------------------- |
| `Expert` | Create/edit courses, assign custom courses, view user feedback |
| `User`   | Subscribe, access courses, submit feedback                     |
| `Admin`  | Manage packages, moderate content (optional)                   |

---

## 🔄 Relationships Summary

* A **Course** has multiple **Days**
* A **Day** has multiple **Tasks**
* A **Course** belongs to a **Package**
* A **User** can **subscribe** to a Package
* A **Feedback** is tied to a **User**, **Course**, and optionally **Task**

---

Would you like me to format this as an **OpenAPI YAML draft**, ERD diagram, or include **frontend consumption flow** next?
