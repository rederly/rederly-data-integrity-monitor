const sleep = (millis: number): Promise<void> => (new Promise((resolve) => setTimeout(resolve, millis)));
(async () => {
    console.log(new Date());
    await sleep(5000);
    console.log('HELLO WORLD');
    console.log(new Date());
})();
