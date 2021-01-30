export class TaskContext {
    public messages: string[] = [];

    constructor(public taskName: string) {}

    addMessage(message: string) {
        this.messages.push(message);
    }
}

export class StageContext {
    public tasks: TaskContext[] = [];

    constructor(public stageName: string) {}

    newTask(taskName: string): TaskContext {
        const task = new TaskContext(taskName);
        this.tasks.push(task);
        return task;
    }
}

export class BuildContext {
    public stages: StageContext[] = [];

    newStage(stageName: string): StageContext {
        const stage = new StageContext(stageName);
        this.stages.push(stage);
        return stage;
    }
}
