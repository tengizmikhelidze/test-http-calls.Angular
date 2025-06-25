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
