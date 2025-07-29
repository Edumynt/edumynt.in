---
title: "Singleton Pattern"
description: "Learn the Singleton design pattern in JavaScript"
course: "JavaScript Fundamentals"
order: 1
tags: ["javascript", "design-patterns", "singleton", "advanced"]
date: 2024-01-20
---

# Singleton Pattern

The Singleton pattern ensures that a class has only one instance and provides global access to that instance.

## Implementation

```javascript
class Singleton {
  constructor() {
    if (Singleton.instance) {
      return Singleton.instance;
    }
    
    this.data = {};
    Singleton.instance = this;
    return this;
  }
  
  setData(key, value) {
    this.data[key] = value;
  }
  
  getData(key) {
    return this.data[key];
  }
}

// Usage
const instance1 = new Singleton();
const instance2 = new Singleton();

console.log(instance1 === instance2); // true
```

## Use Cases

- Database connections
- Logging services
- Configuration settings
- Cache management

## Benefits and Drawbacks

**Benefits:**
- Controlled access to single instance
- Reduced memory usage
- Global access point

**Drawbacks:**
- Can create tight coupling
- Difficult to unit test
- Violates Single Responsibility Principle

This demonstrates the deep nesting capability of our course structure!