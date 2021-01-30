import ContextStatus from '../types/ContextStatus';

export class TaskContext {
    messages: string[] = [];
    status: ContextStatus = ContextStatus.PENDING;

    constructor(public taskName: string) {}

    addMessage(message: string) {
        this.messages.push(message);
    }
}

export class StageContext {
    tasks: TaskContext[] = [];
    status: ContextStatus = ContextStatus.PENDING;

    constructor(public stageName: string) {}

    newTask(taskName: string): TaskContext {
        const task = new TaskContext(taskName);
        this.tasks.push(task);
        return task;
    }
}

export class BuildContext {
    stages: StageContext[] = [];
    status: ContextStatus = ContextStatus.PENDING;

    newStage(stageName: string): StageContext {
        const stage = new StageContext(stageName);
        this.stages.push(stage);
        return stage;
    }
}
