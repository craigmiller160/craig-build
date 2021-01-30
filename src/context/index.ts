// export interface TaskContext {
//     taskName: string;
//     messages: string[];
// }
//
// export interface StageContext {
//     stageName: string;
//     tasks: TaskContext[];
// }
//
// export interface BuildContext {
//     stages: StageContext[],
//     startStage: (stageName: string) => StageContext;
// }
//
// const buildContext: BuildContext = {
//     stages: [],
//     startStage(stageName: string): StageContext {
//         const stageContext: StageContext = {
//             stageName,
//             tasks: []
//         };
//         this.stages.push(stageContext);
//         return stageContext;
//     }
// };
//
// export default buildContext;

export class TaskContext {
    public messages: string[] = [];

    constructor(public taskName: string) {}

    addMessage(message: string) {
        this.messages.push(message);
    }
}

export class StageContext {
    public tasks: TaskContext[] = [];
    private currentTask: number = -1;

    constructor(public stageName: string) {}

    newTask(taskName: string): TaskContext {
        const task = new TaskContext(taskName);
        this.tasks.push(task);
        this.currentTask = this.tasks.length - 1;
        return task;
    }

    taskDone() {
        this.currentTask = this.tasks.length;
    }
}

export class BuildContext {
    public stages: StageContext[] = [];
    private currentStage: number = -1;

    newStage(stageName: string): StageContext {
        const stage = new StageContext(stageName);
        this.stages.push(stage);
        this.currentStage = this.stages.length - 1;
        return stage;
    }

    stageDone() {
        this.currentStage = this.stages.length;
    }
}