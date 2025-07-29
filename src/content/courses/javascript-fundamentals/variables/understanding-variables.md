---
title: "Understanding Variables"
description: "Learn the basics of JavaScript variables and how to use them"
course: "JavaScript Fundamentals"
chapter: "Variables"
order: 1
tags: ["javascript", "variables", "basics"]
date: 2024-01-15
---

# Understanding Variables

Variables are one of the most fundamental concepts in JavaScript programming. They allow us to store and manipulate data throughout our programs.

## What are Variables?

A variable is a container that holds a value. Think of it like a labeled box where you can store information and retrieve it later.

```javascript
let message = "Hello, World!";
console.log(message); // Output: Hello, World!
```

## Variable Declaration

In JavaScript, we have three ways to declare variables:

### 1. `let` - Block Scoped
```javascript
let name = "John";
let age = 25;
```

### 2. `const` - Constants
```javascript
const PI = 3.14159;
const API_URL = "https://api.example.com";
```

### 3. `var` - Function Scoped (Legacy)
```javascript
var oldStyle = "Not recommended";
```

> **Note**: It's recommended to use `let` and `const` instead of `var` in modern JavaScript.

## Variable Naming Rules

When naming variables, follow these rules:

- Must start with a letter, underscore (_), or dollar sign ($)
- Can contain letters, numbers, underscores, and dollar signs
- Cannot use reserved keywords
- Case-sensitive

### Good Examples:
```javascript
let userName = "alice";
let _privateVar = "hidden";
let $element = document.getElementById("myDiv");
let age2 = 30;
```

### Bad Examples:
```javascript
let 2age = 30;        // Cannot start with number
let user-name = "bob"; // Cannot use hyphens
let let = "keyword";   // Cannot use reserved words
```

## Next Steps

Now that you understand variables, let's move on to learning about [[Data Types]] and how variables can store different kinds of information.

## Practice Exercise

Try creating variables for:
1. Your name (string)
2. Your age (number)
3. Whether you like programming (boolean)

```javascript
// Your code here
let myName = "";
let myAge = 0;
let likesCode = true;
```