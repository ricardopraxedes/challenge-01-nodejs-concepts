const express = require("express");
const cors = require("cors");
const { v4: uuidv4 } = require("uuid");

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
  const { username } = request.headers;

  const user = users.find((user) => user.username === username);

  if (!user) {
    return response.status(404).json({ error: "User not found." });
  }

  request.user = user;

  next();
}

function checkTodoExists(request, response, next) {
  const { todos } = request.user;
  const { id } = request.params;

  const todo = todos.find((todo) => todo.id === id);

  if (!todo) {
    return response.status(404).json({ error: "Todo not found." });
  }

  request.todo = todo;
  next();
}

app.post("/users", (request, response) => {
  const { name, username } = request.body;

  const userExists = users.some((user) => user.username === username);

  if (userExists) {
    return response.status(400).json({ error: "User already exists." });
  }

  const user = {
    id: uuidv4(),
    name,
    username,
    todos: [],
  };

  users.push(user);

  return response.status(201).json(user);
});

app.get("/todos", checksExistsUserAccount, (request, response) => {
  const user = request.user;

  const { todos } = user;

  return response.json(todos);
});

app.post("/todos", checksExistsUserAccount, (request, response) => {
  const { todos } = request.user;
  const { title, deadline } = request.body;

  const todo = {
    id: uuidv4(),
    title,
    deadline,
    done: false,
    created_at: new Date(),
  };

  todos.push(todo);

  return response.status(201).json(todo);
});

app.put(
  "/todos/:id",
  checksExistsUserAccount,
  checkTodoExists,
  (request, response) => {
    const { todo } = request;
    const { title, deadline } = request.body;

    todo.title = title
    todo.deadline = deadline

    return response.status(200).json(todo);
  }
);

app.patch(
  "/todos/:id/done",
  checksExistsUserAccount,
  checkTodoExists,
  (request, response) => {
    const { todo } = request;

    todo.done = true

    return response.status(200).json(todo);
  }
);

app.delete(
  "/todos/:id",
  checksExistsUserAccount,
  checkTodoExists,
  (request, response) => {
    const { todo } = request;
    const { todos } = request.user;

    todos.splice(todo, 1);

    return response.status(204).json(todos);
  }
);

module.exports = app;
