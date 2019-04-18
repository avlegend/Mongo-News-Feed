const myPromise = new Promise((resolve, reject) => {
setTimeout(()=>{
    resolve('Hellow');
}, 3000);
});


myPromise.then(res=>console.log(res)).catch(err=>console.log(err));