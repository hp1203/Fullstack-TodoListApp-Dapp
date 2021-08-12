pragma solidity ^0.5.11;
pragma experimental ABIEncoderV2;

contract Todo {
    struct Task {
        string title;
        uint date;
        bool isCompleted;
    }
    
    struct Tasks {
        Task[] tasks;
    }

    mapping (address => Tasks) private TaskAuther;
    
    event TaskCreated(
        string title,
        bool isCompleted
     );

    event TaskUpdated(
        Task task,
        bool completed
    );
    
    event TaskDeleted(
        Task task
    );

    function addTask(string calldata _task) external returns(Task[] memory) {
        TaskAuther[msg.sender].tasks.push(Task({
            title: _task, 
            date: now, 
            isCompleted: false
        }));

        emit TaskCreated(_task, false);
        return TaskAuther[msg.sender].tasks;
    }

    function getTasks() public view returns(Task[] memory) {
        // require(TaskAuther[msg.sender].tasks.length == 0, "No list found");
        return TaskAuther[msg.sender].tasks;
    }

    function updateTask(uint _taskIndex, bool _status) external {
        // require(!TaskAuther[msg.sender].tasks[_taskIndex - 1].isCompleted, "Todo was completed");

        TaskAuther[msg.sender].tasks[_taskIndex].isCompleted = _status;
        emit TaskUpdated(TaskAuther[msg.sender].tasks[_taskIndex], _status);

    }

    function removeTask(uint _taskIndex) external {
        delete TaskAuther[msg.sender].tasks[_taskIndex];
        for(uint i = _taskIndex; i < TaskAuther[msg.sender].tasks.length - 1; i++){
            TaskAuther[msg.sender].tasks[i] = TaskAuther[msg.sender].tasks[i + 1];
        }
        TaskAuther[msg.sender].tasks.pop();
    }

    function getTotalTasks() external view returns(uint) {
        return TaskAuther[msg.sender].tasks.length;
    }
}