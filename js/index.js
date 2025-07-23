// alert("connected");
$(document).ready(function () {
  //create Base URL variable
  const BASE_URL = "http://localhost:4000";

  /**API Request Functions */

  //get all todos from DB
  const fetchTodos = async () => {
    //fetch data from the server using the fetch API
    const response = await fetch(`${BASE_URL}/todos`);

    //convert the response to JSON
    const data = await response.json();
    // console.log({ data });

    //return the data
    return data;
  };

  //get a todo by its ID
  const fetchTodo = async (id) => {
    //fetch data from the server using the fetch API
    const response = await fetch(`${BASE_URL}/todos/${id}`);

    //convert the response to JSON
    const data = await response.json();
    // console.log({ data });

    //return the data
    return data;
  };

  //add a new todo to the server
  const addTodo = async (text) => {
    //fetch data from the server using the fetch API
    const response = await fetch(`${BASE_URL}/todos`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ text, completed: false }),
    });

    //convert the response to JSON
    const data = await response.json();
    // console.log({ data });

    //return the data
    return data;
  };

  /**Other functions to handle CRUD requests */

  //create render function to retrieve data from the server and render it to the page
  const render = async () => {
    //fetch all todos from the server
    const todos = await fetchTodos();
    // console.log("todos from render", { todos });

    // Clear the current list
    $("#todoList").empty();

    // Loop through the todos array and append each todo to the list
    todos.forEach(function (todo, index) {
      let todoItem = `<li>
                                  <span class="todo-text ${
                                    todo.completed ? "completed" : ""
                                  }">${todo.text}</span>
                                  <div class="todo-actions">
                                      <button class="btn editTodo" data-index="${
                                        todo.id
                                      }">
                                        <i class="fas fa-edit"></i>
                                        Edit
                                      </button>
                                      <button class="btn toggleTodo" data-index="${
                                        todo.id
                                      }">
                                        <i class="fas fa-${
                                          todo.completed ? "undo" : "check"
                                        }"></i>
                                        ${
                                          todo.completed
                                            ? "Incomplete"
                                            : "Complete"
                                        }
                                      </button>
                                      <button class="btn deleteTodo" data-index="${
                                        todo.id
                                      }">
                                        <i class="fas fa-trash"></i>
                                        Delete
                                      </button>
                                  </div>
                              </li>`;
      $("#todoList").append(todoItem);
    });
  };

  // Call the render function when the page loads
  render();

  // Function to show Bootstrap alert
  const showAlert = (message, type = "danger") => {
    const alertContainer = $("#alertContainer");
    const alertDiv = alertContainer.find(".alert");
    const alertMessage = $("#alertMessage");

    // Update alert type and message
    alertDiv
      .removeClass("alert-danger alert-success alert-warning alert-info")
      .addClass(`alert-${type}`);
    alertMessage.text(message);

    // Show the alert container
    alertContainer.show();

    // Auto-hide after 5 seconds
    setTimeout(() => {
      hideAlert();
    }, 5000);
  };

  // Function to hide Bootstrap alert
  const hideAlert = () => {
    $("#alertContainer").hide();
  };

  //add event listener to the add todo button
  $("#addTodo").click(async (event) => {
    event.preventDefault();
    //get the value of the input field
    const text = $("#newTodo").val().trim();
    // console.log({ text });

    if (!text) {
      showAlert("Please enter a task description.");
      return;
    }

    //add the todo to the server
    try {
      await addTodo(text);
      // Show success message
      showAlert("Task added successfully!", "success");
    } catch (error) {
      console.log(error);
      showAlert("Error adding task. Please try again.");
    } finally {
      //clear the input field regardless of the outcome
      $("#newTodo").val("");
    }

    //re-render the todos by calling the render function
    render();
  });

  // Handle form submission (when user presses Enter)
  $("#todoForm").submit(async function (event) {
    event.preventDefault();
    $("#addTodo").click();
  });

  // Variables to store current todo being deleted
  let currentDeleteTodoId = null;
  let currentDeleteTodoText = null;

  //add event listener to the delete button
  //Need to use event delegation since the delete button is dynamically created
  $(document).on("click", ".deleteTodo", async function () {
    // Get the id and text of the todo to be deleted
    const id = $(this).data("index");
    const todoText = $(this).closest("li").find(".todo-text").text();

    // Store current todo info for later use
    currentDeleteTodoId = id;
    currentDeleteTodoText = todoText;

    // Populate the modal with current todo text
    $("#deleteTaskText").text(todoText);

    // Show the confirmation modal
    const deleteModal = new bootstrap.Modal(
      document.getElementById("deleteConfirmModal")
    );
    deleteModal.show();
  });

  // Handle confirm delete button click in the modal
  $("#confirmDeleteTodo").click(async function () {
    try {
      // Delete the todo from the server
      await fetch(`${BASE_URL}/todos/${currentDeleteTodoId}`, {
        method: "DELETE",
      });

      // Hide the modal
      const deleteModal = bootstrap.Modal.getInstance(
        document.getElementById("deleteConfirmModal")
      );
      deleteModal.hide();

      // Reset current todo variables
      currentDeleteTodoId = null;
      currentDeleteTodoText = null;

      // Show success message
      showAlert("Task deleted successfully!", "success");

      // Re-render the todos by calling the render function
      render();
    } catch (error) {
      console.error("Error deleting todo:", error);
      showAlert("Error deleting task. Please try again.");
    }
  });

  //add event listener to the toggleTodo button
  //Need to use event delegation since the toggleTodo button is dynamically created
  $(document).on("click", ".toggleTodo", async function () {
    // Get the id of the todo to be deleted
    const id = $(this).data("index");
    // fetch the todo from the server
    const todo = await fetchTodo(id);
    // console.log("editing", { id, todo });

    await fetch(`${BASE_URL}/todos/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      // toggle the todo status to bo the opposite of what it currently is
      body: JSON.stringify({ ...todo, completed: !todo.completed }),
    });

    // Re-render the todos by calling the render function
    render();
  });

  // Variables to store current todo being edited
  let currentEditTodoId = null;
  let currentEditTodo = null;

  //add event listener to the editTodo button
  //Need to use event delegation since the editTodo button is dynamically created
  $(document).on("click", ".editTodo", async function () {
    // Get the id of the todo to be edited
    const id = $(this).data("index");
    // fetch the todo from the server
    const todo = await fetchTodo(id);

    // Store current todo info for later use
    currentEditTodoId = id;
    currentEditTodo = todo;

    // Populate the modal with current todo text
    $("#editTodoInput").val(todo.text);

    // Show the modal
    const editModal = new bootstrap.Modal(
      document.getElementById("editTodoModal")
    );
    editModal.show();
  });

  // Handle save button click in the modal
  $("#saveEditTodo").click(async function () {
    const newText = $("#editTodoInput").val().trim();

    if (!newText) {
      showAlert("Please enter a task description.");
      return;
    }

    try {
      await fetch(`${BASE_URL}/todos/${currentEditTodoId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ ...currentEditTodo, text: newText }),
      });

      // Hide the modal
      const editModal = bootstrap.Modal.getInstance(
        document.getElementById("editTodoModal")
      );
      editModal.hide();

      // Clear the form
      $("#editTodoInput").val("");

      // Reset current todo variables
      currentEditTodoId = null;
      currentEditTodo = null;

      // Show success message
      showAlert("Task updated successfully!", "success");

      // Re-render the todos by calling the render function
      render();
    } catch (error) {
      console.error("Error updating todo:", error);
      showAlert("Error updating task. Please try again.");
    }
  });

  // Handle form submission in the modal (when user presses Enter)
  $("#editTodoForm").submit(function (e) {
    e.preventDefault();
    $("#saveEditTodo").click();
  });
});
