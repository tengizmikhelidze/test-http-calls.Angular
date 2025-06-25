# 🧪 Testing Angular HTTP Calls

> **Test HTTP Calls And Also It's Subsequent Processes**

---

## ▶️ Introduction

HTTP is the lifeblood of almost every Angular application.  Well‑written unit tests around your data layer give you immediate feedback when an endpoint, payload, or contract changes – *before* users feel the pain.  This guide walks through everything you need to know to test Angular `HttpClient` code with **Jest**, from first principles to advanced scenarios and also by beyond that.

---

## 🪛 Prerequisites

- Node ≥ 18
- Angular ≥ 17
- Jest

---

## 🤖 Example Domain Model

For clarity we’ll use a minimal *Todo* API:

```ts
export interface Todo {
    id: number
    title: string
    completed: boolean
}
```

---

## 👨🏻‍💻 Implementing the Service

```ts
import {inject, Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import {Todo} from '../../shared/interfaces/todo.interface';
import {environment} from '../../../environments/environment';

@Injectable({
    providedIn: 'root'
})
export class TodoService {
    private https = inject(HttpClient);

    getAll(): Observable<Todo[]> {
        return this.https.get<Todo[]>(`${environment.todoUrl}`);
    }

    add(todo: Omit<Todo, 'id'>): Observable<Todo> {
        return this.https.post<Todo>(`${environment.todoUrl}`, todo);
    }

    delete(id: number): Observable<void> {
        return this.https.delete<void>(`${environment.todoUrl}/${id}`);
    }
}

```

---

## 🔎 Testing HTTP Fundamentals

> **Key principle:** *Never hit real backends in unit tests.*  Use Angular’s `HttpTestingController` to intercept, assert, and respond.


### 🧐️Lets See Whole Test File And Then We Will Discuss Each Section

```ts
import {TestBed} from '@angular/core/testing';

import {TodoService} from './todo.service';
import {HttpTestingController, provideHttpClientTesting} from '@angular/common/http/testing';
import {provideHttpClient} from '@angular/common/http';
import {environment} from '../../../environments/environment';
import {Todo} from '../../shared/interfaces/todo.interface';

describe('TodoService / ', () => {
    let service: TodoService;
    let https: HttpTestingController;

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [
                provideHttpClient()
                , provideHttpClientTesting()
                , TodoService
            ]
        });
        service = TestBed.inject(TodoService);
        https = TestBed.inject(HttpTestingController);
    });

    // Ensure no pending HTTP requests after each test for this describe block
    afterEach(() => https.verify());

    // First test to check if the service is created successfully
    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    // Test Cases for the Get All method
    describe("getAll / ", () => {
        // Mock Todos for this describe block
        let mockTodos: Todo[] = [
            {id: 1, title: 'Test Todo 1', completed: false},
            {id: 2, title: 'Test Todo 2', completed: true}
        ]

        // Ensure no pending HTTP requests after each test  for this describe block
        afterEach(() => https.verify());

        it("should check correct HTTP Call", () => {
            // Call Get All method
            service.getAll().subscribe();

            // Intercept outgoing HTTP request and assert details
            const req = https.expectOne(`${environment.todoUrl}`);

            // Check request method
            expect(req.request.method).toBe('GET');

            // Respond with mock response
            req.flush(mockTodos);
        })

        it("should handle errors gracefully", () => {
            const mockError = new ProgressEvent('error');

            service.getAll().subscribe({
                error: (err) => {
                    // Check if the error is provided
                    expect(err).toBeTruthy()
                    expect(err.status).toEqual(500);
                }
            });

            const req = https.expectOne(`${environment.todoUrl}`);

            // Respond with mock response
            req.error(mockError, { status: 500, statusText: 'Server Error' }); // simulate error
        })

        it("should return an array of todos", () => {
            service.getAll().subscribe(
                todos => {
                    expect(todos).toEqual(mockTodos);
                    expect(todos.length).toBe(2);
                    expect(todos[0].id).toBe(1);
                    expect(todos[1].title).toBe('Test Todo 2');
                    // add every check you want to do here
                }
            );

            const req = https.expectOne(`${environment.todoUrl}`);

            // Respond with mock response
            req.flush(mockTodos);
        })

    })

    // Test Cases for the Add method
    describe("add / ", () => {
        // Mock  request and response for this describe block
        let mockAdd: Todo = {id: 1, title: 'Test Todo 1', completed: false}
        let mockResponse: Todo = {...mockAdd};

        // Ensure no pending HTTP requests after each test  for this describe block
        afterEach(() => https.verify());

        it("should check correct HTTP Call", () => {
            // Call Add  method
            service.add(mockAdd).subscribe({
                next: (res) => {
                    expect(res).toEqual(mockResponse);
                }
            });

            // Intercept outgoing HTTP request and assert details
            const req = https.expectOne(`${environment.todoUrl}`);

            //Check request method and body
            expect(req.request.method).toBe('POST');
            expect(req.request.body).toEqual(mockAdd);

            // Respond with mock response
            req.flush(mockResponse);
        })

        it("should handle errors gracefully", () => {
            const mockError = new ProgressEvent('error');

            service.add(mockAdd).subscribe({
                error: (err) => {
                    // Check if the error is provided
                    expect(err).toBeTruthy()
                    expect(err.status).toEqual(400);
                    expect(err.statusText).toEqual("Bad Request");
                }
            });

            const req = https.expectOne(`${environment.todoUrl}`);

            // Simulate error
            req.error(mockError, { status: 400, statusText: 'Bad Request' });
        })

    })

    // Test Cases for the Delete method
    describe("delete / ", () => {
        let mockTodoId = 1;

        // Ensure no pending HTTP requests after each test  for this describe block
        afterEach(() => https.verify());

        it("should check correct HTTP Call", () => {
            // Call Delete  method
            service.delete(mockTodoId).subscribe();

            // Intercept outgoing HTTP request and assert details
            const req = https.expectOne(`${environment.todoUrl}/${mockTodoId}`);

            //Check request method and body
            expect(req.request.method).toBe('DELETE');

            // Simulate a successful response
            req.flush(null);
        })

        it("should handle errors gracefully", () => {
            const mockError = new ProgressEvent('error');

            service.delete(mockTodoId).subscribe({
                error: (err) => {
                    // Check if the error is provided
                    expect(err).toBeTruthy()
                }
            });

            const req = https.expectOne(`${environment.todoUrl}/${mockTodoId}`);

            // Simulate error
            req.error(mockError);
        })

    })
});
```

---

## ✅ Testing Successful HTTP Calls

When testing successful HTTP calls, you want to verify:
- The **correct method** is used (`GET`, `POST`, etc.)
- The **request URL** matches expectations
- The **request body** (for POST/PUT) is correct
- The service properly **handles the server response**

Here's an example for a simple `GET` request using `getAll()` from `TodoService`.

```ts
it("should check correct HTTP Call", () => {
    service.getAll().subscribe();
    const req = https.expectOne(`${environment.todoUrl}`);
    expect(req.request.method).toBe('GET');
    req.flush(mockTodos);
})
```

### 🧠 What Each Line Does
- ```service.getAll().subscribe();```
  Invokes the getAll() method, triggering an HTTP GET request to fetch all todos.

- ```const req = https.expectOne(...);```
  Intercepts a single HTTP request matching environment.todoUrl.
  If no match is found (or more than one), the test fails.

- ```expect(req.request.method).toBe('GET');```
  Asserts that the request was a GET request, confirming correct HTTP verb usage.

- ``req.flush(mockTodos);``
  Simulates a successful backend response by returning the mockTodos array, allowing the test to proceed as if the real server responded.
---

## 🚨 Error Handling

When testing error HTTP calls, you want to verify:
- The **request URL** matches expectations
- The test properly **returns an error for the request**
- The service properly **catches the error and extracts meaningful data**

```ts
it("should handle errors gracefully", () => {
    const mockError = new ProgressEvent('error');
    service.getAll().subscribe({
        error: (err) => {
            expect(err).toBeTruthy()
            expect(err.status).toEqual(500);
        }
    });
    const req = https.expectOne(`${environment.todoUrl}`);
    req.error(mockError, { status: 500, statusText: 'Server Error' }); // simulate error
})
```
### 🧠 What Each Line Does

- ```const mockError = new ProgressEvent('error');```  
  Creates a mock `ProgressEvent` to simulate a low-level network failure or unexpected HTTP error.

- ```service.getAll().subscribe({ error: (err) => { ... } });```  
  Invokes the `getAll()` method, subscribing only to the error path, which gets triggered if the request fails.

- ```expect(err).toBeTruthy();```  
  Asserts that an error was received and is not null or undefined.

- ```expect(err.status).toEqual(500);```  
  Verifies that the returned error contains the expected HTTP status code (`500` in this case).

- ```const req = https.expectOne(`${environment.todoUrl}`);```  
  Intercepts a single HTTP request sent to the expected URL. The test fails if the request is missing or if more than one is sent.

- ```req.error(mockError, { status: 500, statusText: 'Server Error' });```  
  Simulates a backend failure by triggering the error response with a `500 Internal Server Error`.

#  🏁 Conclusion

With Angular’s built‑in *test harness*, you can create fast, reliable tests around every HTTP call.  The sample project below contains everything you saw here – clone it, install it and run `npm test`, and start building with confidence 🚀.

────୨ৎ────────୨ৎ────────୨ৎ────────୨ৎ────

