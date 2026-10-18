import { describe, it, expect } from 'vitest';
import {
  isValidTransition,
  transitionQueueItem,
  QueueTransitionError,
} from '../src/services/queue/state-machine';
import { QueueItem } from '../src/types/queue';

describe('Queue State Machine', () => {
  const baseItem: QueueItem = {
    id: 'q_1',
    groupId: 'g_1',
    postId: 'p_1',
    status: 'PENDING',
    order: 1,
    createdAt: 1000,
  };

  it('allows valid state progression: PENDING -> READY', () => {
    expect(isValidTransition('PENDING', 'READY')).toBe(true);
    const item = transitionQueueItem(baseItem, 'READY');
    expect(item.status).toBe('READY');
  });

  it('allows valid state progression: READY -> IN_PROGRESS', () => {
    expect(isValidTransition('READY', 'IN_PROGRESS')).toBe(true);
    const readyItem = { ...baseItem, status: 'READY' as const };
    const item = transitionQueueItem(readyItem, 'IN_PROGRESS');
    expect(item.status).toBe('IN_PROGRESS');
    expect(item.startedAt).toBeDefined();
  });

  it('allows valid state progression: IN_PROGRESS -> WAITING_FOR_USER', () => {
    expect(isValidTransition('IN_PROGRESS', 'WAITING_FOR_USER')).toBe(true);
    const inProg = { ...baseItem, status: 'IN_PROGRESS' as const, startedAt: 1000 };
    const item = transitionQueueItem(inProg, 'WAITING_FOR_USER');
    expect(item.status).toBe('WAITING_FOR_USER');
  });

  it('allows valid state progression: WAITING_FOR_USER -> POSTED', () => {
    expect(isValidTransition('WAITING_FOR_USER', 'POSTED')).toBe(true);
    const waiting = { ...baseItem, status: 'WAITING_FOR_USER' as const, startedAt: 1000 };
    const item = transitionQueueItem(waiting, 'POSTED');
    expect(item.status).toBe('POSTED');
    expect(item.completedAt).toBeDefined();
  });

  it('allows valid state progression: WAITING_FOR_USER -> SKIPPED', () => {
    expect(isValidTransition('WAITING_FOR_USER', 'SKIPPED')).toBe(true);
    const waiting = { ...baseItem, status: 'WAITING_FOR_USER' as const };
    const item = transitionQueueItem(waiting, 'SKIPPED');
    expect(item.status).toBe('SKIPPED');
    expect(item.completedAt).toBeDefined();
  });

  it('allows valid state progression: IN_PROGRESS -> FAILED with error message', () => {
    expect(isValidTransition('IN_PROGRESS', 'FAILED')).toBe(true);
    const inProg = { ...baseItem, status: 'IN_PROGRESS' as const };
    const item = transitionQueueItem(inProg, 'FAILED', 'Tab crashed');
    expect(item.status).toBe('FAILED');
    expect(item.errorMessage).toBe('Tab crashed');
    expect(item.retryCount).toBe(1);
  });

  it('allows valid retry progression: FAILED -> READY', () => {
    expect(isValidTransition('FAILED', 'READY')).toBe(true);
    const failedItem: QueueItem = {
      ...baseItem,
      status: 'FAILED',
      errorMessage: 'Network error',
      retryCount: 1,
    };
    const item = transitionQueueItem(failedItem, 'READY');
    expect(item.status).toBe('READY');
    expect(item.errorMessage).toBeUndefined();
    expect(item.retryCount).toBe(1); // Keeps track of past attempts
  });

  it('rejects illegal transitions like POSTED -> PENDING', () => {
    expect(isValidTransition('POSTED', 'PENDING')).toBe(false);
    const postedItem = { ...baseItem, status: 'POSTED' as const };
    expect(() => transitionQueueItem(postedItem, 'PENDING')).toThrow(QueueTransitionError);
  });

  it('rejects illegal transitions like FAILED -> POSTED without running', () => {
    expect(isValidTransition('FAILED', 'POSTED')).toBe(false);
    const failedItem = { ...baseItem, status: 'FAILED' as const };
    expect(() => transitionQueueItem(failedItem, 'POSTED')).toThrow(QueueTransitionError);
  });
});
