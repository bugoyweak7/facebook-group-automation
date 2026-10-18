import { describe, it, expect } from 'vitest';
import {
  extractVariables,
  renderTemplate,
  formatPostWithTemplate,
  buildVariableMapFromPost,
} from '../src/services/template/template-engine';
import { Post } from '../src/types/post';

describe('Template Engine', () => {
  it('extracts variable tokens correctly', () => {
    const template = '{product_name} on sale!\nPrice: {price}\nLocation: {location}\nCall {contact_info}';
    const vars = extractVariables(template);
    expect(vars).toEqual(['product_name', 'price', 'location', 'contact_info']);
  });

  it('renders template by substituting variables', () => {
    const template = '{product_name} - {price} - {location}';
    const map = {
      product_name: 'iPhone 15 Pro',
      price: '$999',
      location: 'Dhaka',
    };
    const output = renderTemplate(template, map);
    expect(output).toBe('iPhone 15 Pro - $999 - Dhaka');
  });

  it('formats a Post using template and variable mappings', () => {
    const post: Post = {
      id: 'p1',
      title: 'Bike Sale',
      productName: 'Yamaha FZS V3',
      price: '2,15,000 BDT',
      oldPrice: '2,40,000 BDT',
      description: 'Excellent condition',
      location: 'Mirpur, Dhaka',
      images: [],
      createdAt: 1000,
      updatedAt: 1000,
    };

    const template = '🚨 {product_name} 🚨\nPrice: {price} {old_price_tag}\n{description}\n📍 {location}';
    const result = formatPostWithTemplate(post, template);

    expect(result).toContain('Yamaha FZS V3');
    expect(result).toContain('2,15,000 BDT');
    expect(result).toContain('(Regular: 2,40,000 BDT)');
    expect(result).toContain('Mirpur, Dhaka');
  });

  it('falls back to standard structured format when no template provided', () => {
    const post: Post = {
      id: 'p2',
      title: 'MacBook Sale',
      productName: 'MacBook Air M2',
      price: '$1,050',
      description: 'Brand new in box',
      location: 'Chattogram',
      images: [],
      createdAt: 1000,
      updatedAt: 1000,
    };

    const formatted = formatPostWithTemplate(post);
    expect(formatted).toContain('MacBook Air M2');
    expect(formatted).toContain('Price: $1,050');
    expect(formatted).toContain('Brand new in box');
  });
});
