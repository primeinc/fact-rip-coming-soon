import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { Modal } from './Modal';

describe('Modal', () => {
  it('should not render when closed', () => {
    render(
      <Modal isOpen={false} onClose={vi.fn()} hasJoined={false} />
    );
    
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('should render when open', () => {
    render(
      <Modal isOpen={true} onClose={vi.fn()} hasJoined={false} />
    );
    
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByText('Watchtower Activated')).toBeInTheDocument();
  });

  it('should show different content for returning users', () => {
    render(
      <Modal isOpen={true} onClose={vi.fn()} hasJoined={true} />
    );
    
    expect(screen.getByText('Already Watching')).toBeInTheDocument();
  });

  it('should close on Escape key', () => {
    const onClose = vi.fn();
    render(
      <Modal isOpen={true} onClose={onClose} hasJoined={false} />
    );
    
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(onClose).toHaveBeenCalled();
  });

  it('should close on overlay click', () => {
    const onClose = vi.fn();
    render(
      <Modal isOpen={true} onClose={onClose} hasJoined={false} />
    );
    
    const overlay = screen.getByRole('dialog').parentElement;
    fireEvent.click(overlay!);
    expect(onClose).toHaveBeenCalled();
  });

  it('should not close on content click', () => {
    const onClose = vi.fn();
    render(
      <Modal isOpen={true} onClose={onClose} hasJoined={false} />
    );
    
    const content = screen.getByRole('dialog');
    fireEvent.click(content);
    expect(onClose).not.toHaveBeenCalled();
  });

  it('should show reset button for returning users', () => {
    const onReset = vi.fn();
    render(
      <Modal isOpen={true} onClose={vi.fn()} hasJoined={true} onReset={onReset} />
    );
    
    const resetButton = screen.getByText('Reset');
    expect(resetButton).toBeInTheDocument();
    
    fireEvent.click(resetButton);
    expect(onReset).toHaveBeenCalled();
  });
});