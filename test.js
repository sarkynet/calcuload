function countMaximumletter(){
    var text = "Hello World";
    var sorted = [];
    var unsorted = [];
    text = text.toLocaleLowerCase();
    textArray = text.split("");
    textArr = text.split("");
    var text_len = text.length;
    function nonrepeat(){
        textArray.sort();
        for (var i = 0; i < text_len; i++){
            if (textArray[i] == textArray[i+1]){
                textArray.splice(i, 1);
            }
        }
        for (var i = 0; i < text_len; i++){
            if (textArray[i] == textArray[i+1]){
                textArray.splice(i, 1);
            }
        }
        return textArray;
    }
    var norepeat = nonrepeat();
    for (var i = 0; i < norepeat.length; i++){
        var counter = 0;
        for (var j = 0; j < textArr.length; j++){
            if (norepeat[i] == textArr[j]){
                counter++;
            }
        }
        sorted.push(counter);
        unsorted.push(counter);
    }
    sorted.sort(function(a,b){return b-a});
    index = sorted[0];
    for (var i = 0; i < unsorted.length; i++){
        if (unsorted[i] == index)
            console.log(norepeat[i]);
    }
}