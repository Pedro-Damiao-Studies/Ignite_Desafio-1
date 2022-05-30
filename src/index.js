const express = require('express');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
  const { username } = request.headers;

  const userExists = users.some((user) => user.username === username);

  if (!userExists) {
    return response.status(400).send({ error: 'User not found' });
  }

  return next();
}

app.post('/users', (request, response) => {
  const { name, username } = request.body;

  const userAlreadyExists = users.some((user) => user.username === username);

  if (userAlreadyExists) {
    return response.status(400).send({ error: 'User already exists' });
  }

  const id = uuidv4();

  const newUser = {
    id,
    name,
    username,
    todos: []
  };

  users.push(newUser);

  return response.status(201).send(newUser);
});

app.get('/todos', checksExistsUserAccount, (request, response) => {
  const { username } = request.headers;

  const user = users.find((user) => user.username === username);

  return response.status(201).send(user.todos);

});

app.post('/todos', checksExistsUserAccount, (request, response) => {
  const { username } = request.headers;
  const { title, deadline } = request.body;

  const newTodo = {
    id: uuidv4(),
    title,
    done: false,
    deadline: new Date(deadline),
    created_at: new Date(),
  }

  const user = users.find((user) => user.username === username);

  user.todos.push(newTodo);

  return response.status(201).send(newTodo);
});

app.put('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { username } = request.headers;
  const { title, deadline } = request.body;
  const { id } = request.params;

  const user = users.find((user) => user.username === username);

  let todo = user.todos.find((todo) => todo.id === id);

  if (!todo) {
    return response.status(404).send({ error: 'Todo not found!' })
  }

  const newTodo = {
    ...todo,
    title,
    deadline: new Date(deadline),
  };

  user.todos = user.todos.map((todo) => {
    if (todo.id === id) {
      return newTodo;
    }

    return todo;
  });

  return response.status(200).send(newTodo);
});

app.patch('/todos/:id/done', checksExistsUserAccount, (request, response) => {
  const { username } = request.headers;
  const { id } = request.params;

  const user = users.find((user) => user.username === username);

  let todo = user.todos.find((todo) => todo.id === id);

  if (!todo) {
    return response.status(404).send({ error: 'Todo not found!' })
  }

  const newTodo = {
    ...todo,
    done: true,
  }

  user.todos = user.todos.map((todo) => {
    if (todo.id === id) {
      return newTodo;
    }

    return todo;
  });

  return response.status(200).send(newTodo);
});

app.delete('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { username } = request.headers;
  const { id } = request.params;

  const user = users.find((user) => user.username === username);

  const todo = user.todos.some((todo) => todo.id === id);

  if (!todo) {
    return response.status(404).send({ error: 'Todo not found!' })
  }

  user.todos = user.todos.filter((todo) => todo.id !== id);

  return response.sendStatus(204);
});

module.exports = app;