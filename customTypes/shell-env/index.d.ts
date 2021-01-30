declare module 'shell-env' {
    interface ShellEnv {
        sync<Envs extends object>(): Envs;
    }

    const shellEnv: ShellEnv;

    export default shellEnv;
}