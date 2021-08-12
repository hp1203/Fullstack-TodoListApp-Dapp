import React, { Component } from "react";
import TodoContract from "./contracts/Todo.json";
import getWeb3 from "./getWeb3";

import "./App.css";

class App extends Component {
  state = { web3: null, accounts: null, contract: null, todos: null, task: "" };

  componentDidMount = async () => {
    try {
      // Get network provider and web3 instance.
      const web3 = await getWeb3();

      // Use web3 to get the user's accounts.
      const accounts = await web3.eth.getAccounts();

      // Get the contract instance.
      const networkId = await web3.eth.net.getId();
      const deployedNetwork = TodoContract.networks[networkId];
      const instance = new web3.eth.Contract(
        TodoContract.abi,
        deployedNetwork && deployedNetwork.address
      );

      // Set web3, accounts, and contract to the state, and then proceed with an
      // example of interacting with the contract's methods.
      this.setState({ web3, accounts, contract: instance }, this.loadTodos);
    } catch (error) {
      // Catch any errors for any of the above operations.
      alert(
        `Failed to load web3, accounts, or contract. Check console for details.`
      );
      console.error(error);
    }
  };

  convertDate = (timestamp) => {
    let unix_timestamp = timestamp;
    // Create a new JavaScript Date object based on the timestamp
    // multiplied by 1000 so that the argument is in milliseconds, not seconds.
    var date = new Date(unix_timestamp * 1000);
    // Hours part from the timestamp
    var hours = date.getHours();
    // Minutes part from the timestamp
    var minutes = "0" + date.getMinutes();
    // Seconds part from the timestamp
    var seconds = "0" + date.getSeconds();

    // Will display time in 10:30:23 format
    return hours + ":" + minutes.substr(-2) + ":" + seconds.substr(-2);
  };

  handleTextChange = (e) => {
    console.log(e.target.value);
    this.setState({
      task: e.target.value,
    });
  };

  addTask = async () => {
    const { accounts, contract, todos } = this.state;
    try {
      // Get the value from the contract to prove it worked.
      const response = await contract.methods.addTask(this.state.task).send({
        from: accounts[0],
      });
      console.log("Todos: ", response);
      this.setState({
        task: "",
      });
      this.loadTodos();
    } catch (err) {
      console.log(err.message);
    }
    // Update state with the result.
    // this.setState({ todos: response });
  };

  loadTodos = async () => {
    const { accounts, contract } = this.state;

    // Get the value from the contract to prove it worked.
    const response = await contract.methods.getTasks().call();
    // Update state with the result.
    this.setState({ todos: response });
    console.log("Todos: ", this.state.todos);
  };

  deleteTodo = async (todo) => {
    const { accounts, contract } = this.state;

    const response = await contract.methods.removeTask(todo).send({
      from: accounts[0],
    });

    console.log("Delete Response: ", response);
    this.loadTodos();
  };

  updateTaskStatus = async (taskIndex, status) => {
    const { accounts, contract } = this.state;

    const response = await contract.methods.updateTask(taskIndex, status).send({
      from: accounts[0],
    });

    console.log("Update Response: ", response);
    this.loadTodos();
  };

  render() {
    if (!this.state.web3) {
      return <div>Loading Web3, accounts, and contract...</div>;
    }
    return (
      <div className="App bg-gray-50 h-screen flex flex-col justify-start items-center py-20 px-4 md:px-20">
        <span className="font-semibold py-2">
          Welcome {this.state.accounts[0]}
        </span>
        <div className="flex flex-col shadow-md bg-white p-4 rounded-md w-full md:w-1/2 mb-4 space-y-2">
          <span className="font-semibold text-xl">Add New Task</span>
          <div className="flex space-x-2">
            <input
              placeholder="Enter your new task"
              className="p-2 bg-white rounded-md border border-gray-100 w-full"
              onChange={(e) => this.handleTextChange(e)}
              value={this.state.task}
            />
            <button
              className="bg-blue-500 py-2 px-4 rounded-md text-white"
              onClick={() => this.addTask()}
            >
              Save
            </button>
          </div>
        </div>
        <div className="shadow-md bg-white p-4 rounded-md w-full md:w-1/2">
          <div className="border-b pb-6 mb-4 border-gray-200">
            <h1 className="text-center text-gray-600 font-semibold text-3xl">
              Todo List
            </h1>
            <p className="text-gray-500 text-sm">
              Smart contract based todo list app.
            </p>
          </div>
          {this.state.todos == null || this.state.todos.length <= 0 ? (
            <div className="list flex flex-col space-y-1">
              <span>No todos found!</span>
            </div>
          ) : (
            <div className="list flex flex-col space-y-1">
              {this.state.todos.map((todo, index) => (
                <div
                  className="listitem flex justify-between items-center p-3 border border-gray-100 shadow-sm"
                  key={index}
                >
                  <div className="flex flex-col">
                    <span
                      className={`font-normal text-left ${
                        todo["isCompleted"] ? "line-through" : ""
                      }`}
                    >
                      {todo["title"]}
                    </span>
                    <span className="font-normal text-sm text-gray-500 text-left">
                      {this.convertDate(todo["date"])}
                    </span>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      className="text-white text-sm bg-red-600 p-2 w-10 h-10 shadow-md rounded-full"
                      onClick={() => this.deleteTodo(index)}
                    >
                      <i className="fas fa-trash"></i>
                    </button>
                    {todo["isCompleted"] ? (
                      <button
                        className="text-white text-sm bg-red-600 p-2 w-10 h-10 shadow-md rounded-full"
                        onClick={() => this.updateTaskStatus(index, true)}
                      >
                        <i className="fas fa-times"></i>
                      </button>
                    ) : (
                      <button
                        className="text-white text-sm bg-green-600 p-2 w-10 h-10 shadow-md rounded-full"
                        onClick={() => this.updateTaskStatus(index, true)}
                      >
                        <i className="fas fa-check "></i>
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }
}

export default App;
