---
title: "Let vs Const vs Var"
description: "Understanding the differences between variable declaration methods"
course: "JavaScript Fundamentals"
order: 2
tags: ["javascript", "variables", "basics", "scope"]
date: 2024-01-16
---

# Let vs Const vs Var

Understanding the differences between `let`, `const`, and `var` is crucial for writing modern JavaScript.

## Summary Table

| Feature | `var` | `let` | `const` |
|---------|-------|-------|---------|
| Scope | Function | Block | Block |
| Hoisting | Yes (undefined) | Yes (TDZ) | Yes (TDZ) |
| Reassignment | Yes | Yes | No |
| Redeclaration | Yes | No | No |

## Detailed Comparison

### Scope Differences
```javascript
function scopeExample() {
  if (true) {
    var varVariable = "I'm function scoped";
    let letVariable = "I'm block scoped";
    const constVariable = "I'm also block scoped";
  }
  
  console.log(varVariable); // Works
  // console.log(letVariable); // Error
  // console.log(constVariable); // Error
}
```

### Hoisting Behavior
```javascript
console.log(varVar); // undefined
console.log(letVar); // ReferenceError
console.log(constVar); // ReferenceError

var varVar = "hoisted";
let letVar = "not hoisted";
const constVar = "also not hoisted";
```

## Best Practices

1. Use `const` by default
2. Use `let` when you need to reassign
3. Avoid `var` in modern JavaScript

This lesson is nested under basics/variables to demonstrate our flexible structure!