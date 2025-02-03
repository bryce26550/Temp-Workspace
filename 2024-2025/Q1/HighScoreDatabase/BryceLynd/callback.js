var answer = "";

function doLongTask(callback) {
    console.log("Getting your answer now...");
    setTimeout(() => {answer='No, just No'; callback();}, 3000);

}

var printAnswer = () => {console.log(`Your answer is ${answer}`);}

doLongTask(printAnswer);


