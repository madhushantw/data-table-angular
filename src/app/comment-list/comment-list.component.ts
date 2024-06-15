import { Component, OnInit } from '@angular/core';
import { CommentService } from '../comment.service';
import { Comment } from '../comment.interface'
import { debounceTime } from 'rxjs';
import * as _ from 'lodash';

@Component({
  selector: 'app-comment-list',
  templateUrl: './comment-list.component.html',
  styleUrl: './comment-list.component.css'
})
export class CommentListComponent implements OnInit {
  comments: Comment[] = [];
  searchQuery = '';
  page = 1;
  rowsPerPage:any = 10;
  sortColumn = 'id';
  sortOrder: 'asc' | 'desc' = 'asc';
  loading = true;
  rowsOptions = [10, 15, 20, 'all'];

  editing = false;
  editId: number | null = null;
  editComment: any = { id: null, name: '', email: '', body: '' };

  constructor(private commentService: CommentService) {}

  ngOnInit(): void {
    this.fetchComments();
  }

  fetchComments(): void {
    this.loading = true;
    this.commentService.getComments().subscribe(
      (response) => {
        this.comments = response;
        this.loading = false;
      },
      (error) => {
        console.error('Error fetching comments:', error);
        this.loading = false;
      }
      );
  }

  get filteredComments(): any[] {
    return this.comments.filter(
      (comment) =>
        comment.name.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
        comment.email.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
        comment.body.toLowerCase().includes(this.searchQuery.toLowerCase())
    );
  }

  get sortedComments(): any[] {
    return _.orderBy(this.filteredComments, [this.sortColumn], [this.sortOrder]);
  }

  get paginatedComments(): any[] {
    const start = (this.page - 1) * this.rowsPerPage;
    return this.rowsPerPage === 'all'
      ? this.sortedComments
      : this.sortedComments.slice(start, start + this.rowsPerPage);
  }

  get totalPages(): number {
    return this.rowsPerPage === 'all'
      ? 1
      : Math.ceil(this.filteredComments.length / this.rowsPerPage);
  }

  sortBy(column: string): void {
    if (this.sortColumn === column) {
      this.sortOrder = this.sortOrder === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortColumn = column;
      this.sortOrder = 'asc';
    }
  }

  nextPage(): void {
    if (this.page < this.totalPages) {
      this.page++;
    }
  }

  prevPage(): void {
    if (this.page > 1) {
      this.page--;
    }
  }

  debouncedSearch(): void {
    debounceTime(300);
    this.page = 1;
  }

  startEdit(comment: any): void {
    this.editing = true;
    this.editId = comment.id;
    this.editComment = { ...comment };
  }

  saveEdit(): void {
    const index = this.comments.findIndex((c) => c.id === this.editId);
    if (index !== -1) {
      this.comments[index] = { ...this.editComment };
    }
    this.editing = false;
    this.editId = null;
  }

  cancelEdit(): void {
    this.editing = false;
    this.editId = null;
  }

  deleteComment(id: number): void {
    this.comments = this.comments.filter((comment) => comment.id !== id);
  }
}
