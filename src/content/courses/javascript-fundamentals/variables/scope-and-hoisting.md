---
title: "Variable Scope and Hoisting"
description: "Understand how variable scope and hoisting work in JavaScript"
course: "JavaScript Fundamentals"
chapter: "Variables"
order: 2
tags: ["javascript", "scope", "hoisting", "advanced"]
date: 2024-01-16
---

# Variable Scope and Hoisting

Understanding scope and hoisting is crucial for writing reliable JavaScript code. Let's explore these concepts in detail.

## Scope Types

### Global Scope
Variables declared outside any function or block have global scope:

```javascript
let globalVar = "I'm global!";

function showGlobal() {
    console.log(globalVar); // Accessible here
}
```

### Function Scope
Variables declared inside a function are only accessible within that function:

```javascript
function myFunction() {
    let functionScoped = "Only inside function";
    console.log(functionScoped); // Works fine
}

// console.log(functionScoped); // Error: not defined
```

### Block Scope
Variables declared with `let` and `const` inside a block `{}` are block-scoped:

```javascript
if (true) {
    let blockScoped = "Inside block";
    const alsoBlockScoped = "Me too!";
    var notBlockScoped = "I escape!";
}

// console.log(blockScoped); // Error
// console.log(alsoBlockScoped); // Error
console.log(notBlockScoped); // Works (but shouldn't be used)
```

## Hoisting

Hoisting is JavaScript's behavior of moving declarations to the top of their scope.

### Variable Hoisting with `var`
```javascript
console.log(hoistedVar); // undefined (not error!)
var hoistedVar = "I'm hoisted";
```

This is interpreted as:
```javascript
var hoistedVar; // undefined
console.log(hoistedVar);
hoistedVar = "I'm hoisted";
```

### `let` and `const` Hoisting
```javascript
// console.log(notHoisted); // ReferenceError
let notHoisted = "I cause an error";
```

## Best Practices

1. **Always declare variables before using them**
2. **Use `const` by default, `let` when you need to reassign**
3. **Avoid `var` in modern JavaScript**
4. **Keep variable scope as narrow as possible**

```javascript
// Good
function calculateArea(radius) {
    const PI = 3.14159;
    let area = PI * radius * radius;
    return area;
}

// Avoid
var PI = 3.14159; // Global when it could be local
function calculateArea(radius) {
    area = PI * radius * radius; // Implicit global
    return area;
}
```

## Common Pitfalls

### The `var` Loop Problem
```javascript
// Problem
for (var i = 0; i < 3; i++) {
    setTimeout(() => console.log(i), 100); // Prints 3, 3, 3
}

// Solution
for (let i = 0; i < 3; i++) {
    setTimeout(() => console.log(i), 100); // Prints 0, 1, 2
}
```

### Temporal Dead Zone
```javascript
console.log(typeof myLet); // ReferenceError
let myLet = "defined";
```

## Summary

- Use `let` and `const` instead of `var`
- Understand the difference between function, block, and global scope
- Be aware of hoisting behavior
- Declare variables at the top of their scope for clarity

Next up: [[Data Types and Operations]]