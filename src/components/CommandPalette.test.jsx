import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import CommandPalette from './CommandPalette';

describe('CommandPalette Component', () => {
  const mockNotes = [
    { id: '1', title: 'Test Note Alpha', content: 'Testing content' },
    { id: '2', title: 'Beta Concept', content: 'Another test' }
  ];

  it('does not render when isOpen is false', () => {
    render(<CommandPalette isOpen={false} notes={mockNotes} onClose={vi.fn()} />);
    expect(screen.queryByPlaceholderText(/Search/i)).not.toBeInTheDocument();
  });

  it('renders correctly when isOpen is true', () => {
    render(<CommandPalette isOpen={true} notes={mockNotes} onClose={vi.fn()} />);
    expect(screen.getByPlaceholderText(/Search/i)).toBeInTheDocument();
    expect(screen.getByText('Create New Note')).toBeInTheDocument();
  });
});