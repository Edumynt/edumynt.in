---
title: "Introduction to Functions"
description: "Learn how to create and use functions in JavaScript"
course: "JavaScript Fundamentals"
chapter: "Functions"
order: 1
tags: ["javascript", "functions", "basics"]
date: 2024-01-17
---

# Introduction to Functions

Functions are reusable blocks of code that perform specific tasks. They're one of the fundamental building blocks of JavaScript programming.

## What are Functions?

A function is like a recipe - it takes ingredients (parameters), follows steps (code), and produces a result (return value).

```javascript
function greet(name) {
    return `Hello, ${name}!`;
}

let message = greet("Alice");
console.log(message); // "Hello, Alice!"
```

## Function Declaration

The most common way to create a function:

```javascript
function functionName(parameter1, parameter2) {
    // Function body
    return result;
}
```

### Example:
```javascript
function addNumbers(a, b) {
    let sum = a + b;
    return sum;
}

let result = addNumbers(5, 3);
console.log(result); // 8
```

## Function Expressions

You can also assign functions to variables:

```javascript
let multiply = function(a, b) {
    return a * b;
};

console.log(multiply(4, 6)); // 24
```

## Arrow Functions (ES6)

A more concise way to write functions:

```javascript
// Traditional function
let square = function(x) {
    return x * x;
};

// Arrow function
let square = (x) => {
    return x * x;
};

// Even shorter for single expressions
let square = x => x * x;
```

## Parameters and Arguments

- **Parameters** are variables listed in the function definition
- **Arguments** are the actual values passed to the function

```javascript
function introduce(name, age, city) { // Parameters
    return `Hi, I'm ${name}, ${age} years old, from ${city}`;
}

// Arguments
let intro = introduce("Bob", 25, "New York");
```

### Default Parameters

You can set default values for parameters:

```javascript
function greet(name = "Guest", greeting = "Hello") {
    return `${greeting}, ${name}!`;
}

console.log(greet());           // "Hello, Guest!"
console.log(greet("Alice"));    // "Hello, Alice!"
console.log(greet("Bob", "Hi")); // "Hi, Bob!"
```

## Return Values

Functions can return values using the `return` statement:

```javascript
function calculateCircleArea(radius) {
    return Math.PI * radius * radius;
}

let area = calculateCircleArea(5);
console.log(area); // 78.54
```

If no `return` is specified, the function returns `undefined`.

## Function Scope

Variables declared inside a function are only accessible within that function:

```javascript
function myFunction() {
    let localVar = "I'm local";
    console.log(localVar); // Works
}

// console.log(localVar); // Error: localVar is not defined
```

## Practice Examples

### 1. Temperature Converter
```javascript
function celsiusToFahrenheit(celsius) {
    return (celsius * 9/5) + 32;
}

console.log(celsiusToFahrenheit(0));   // 32
console.log(celsiusToFahrenheit(100)); // 212
```

### 2. Age Calculator
```javascript
function calculateAge(birthYear) {
    let currentYear = new Date().getFullYear();
    return currentYear - birthYear;
}

console.log(calculateAge(1990)); // Current age
```

### 3. String Formatter
```javascript
function formatName(firstName, lastName) {
    return `${lastName}, ${firstName}`.toUpperCase();
}

console.log(formatName("John", "Doe")); // "DOE, JOHN"
```

## Why Use Functions?

1. **Reusability** - Write once, use many times
2. **Organization** - Break complex problems into smaller parts
3. **Maintainability** - Easier to update and debug
4. **Readability** - Code becomes more self-documenting

## Next Steps

Now that you understand basic functions, let's explore [[Advanced Function Concepts]] including closures, higher-order functions, and more!

## Exercise

Create a function that:
1. Takes a person's name and age as parameters
2. Returns a message about whether they can vote (age >= 18)
3. Use default parameters for both name and age

```javascript
// Your solution here
function canVote(name = "Anonymous", age = 0) {
    // Your code
}
```