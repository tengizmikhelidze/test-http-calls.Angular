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

  add(todo: Todo): Observable<Todo> {
    return this.https.post<Todo>(`${environment.todoUrl}`, todo);
  }

  delete(id: number): Observable<void> {
    return this.https.delete<void>(`${environment.todoUrl}/${id}`);
  }
}
