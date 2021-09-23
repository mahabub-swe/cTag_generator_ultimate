var babel = require("@babel/core");
const fs = require('fs');

let EnglishData = fs.readFileSync('./English.js','utf8');

function dom(tag,attributes,...children){
    function regexKeyReplacer(str){
        return str.
        replace(/\*/g,'\\*').
        replace(/\+/g,'\\+').
        replace(/\?/g,'\\?').
        replace(/\(/g,'\\(').
        replace(/\)/g,'\\)').
        replace(/\[/g,'\\[').
        replace(/\]/g,'\\]')        
    }
    // manage varStore to not to have same name of parent and child
    let node = tag
    let regex = new RegExp(`var ${tag}(\\d?) =`,'g');
    let tagNum = -Infinity
    children.forEach(child=>{
        if(regex.test(child)){
            // let num = child.match(regex)[1]*1+1
            let num = child.match(regex).map(item=>item.match(/var div(\d?) =/)[1]*1).sort((a,b)=>b-a)[0]+1
            if(num>tagNum) tagNum = num
            node = tag+tagNum
        } 
    })
  
    // defining node's attributes
    let attrString = ''
    if(attributes !== null){
        attrString += '{ '
        let keys = Object.keys(attributes);
        keys.forEach((key,indx)=>{
            let engVar = EnglishData.match(RegExp(`var (.+) = stripslashes\\('${regexKeyReplacer(attributes[key])}'\\)`))
            if(engVar) engVar = engVar[1];
            else engVar = "`"+attributes[key]+"`";
            if(indx==keys.length-1) attrString+=`'${key}':${engVar}`;
            else attrString+=`'${key}':${engVar},`;
        })
        attrString+=' }'
    }
    // difining node's content
    let content = ''
    if(children.length>0){
        // if node's content is String of another node, then loop over children and use 'appendChild' to insert
        children.forEach((child,indx)=>{
            if(child.indexOf('cTag')==0){
                if(indx==0) content += `${node}.appendChild(${child});`
                else content += `\n${node}.appendChild(${child});`
                return;
            }
            let childName = child.match(/var (.+) =/i) // extract child variable-name
            if(childName){
                if(indx == 0) content += `${child}\n${node}.appendChild(${childName[1]});`
                else content += `\n${child}\n${node}.appendChild(${childName[1]});`
            }else{
                let engVar = EnglishData.match(RegExp(`var (.+) = stripslashes\\('${regexKeyReplacer(child)}'\\)`))
                if(children.length==1){
                    if(engVar) content += `${node}.innerHTML = ${engVar[1]};`
                    else content += `${node}.innerHTML = '${children}';`
                }
                else if(indx == 0){
                    if(engVar) content += `${node}.append(${engVar[1]});`
                    else content += `${node}.append('${child}');`
                }
                else{
                    if(engVar) content += `\n${node}.append(${engVar[1]});`
                    else content += `\n${node}.append('${child}');`
                } 
            }
        })
    }
  
  
    if(attrString.length==0 || content.length==0){
        if(attrString.length==0 && content.length==0) return `cTag('${tag}')` 
        if(attrString.length==0) return `\tvar ${node} = cTag('${tag}');${('\n'+content).replace(/\n/g,'\n\t')}`
        if(content.length==0) return `cTag('${tag}',${attrString})`
    }
    return `\tvar ${node} = cTag('${tag}',${attrString});${('\n'+content).replace(/\n/g,'\n\t')}`
}
let options = {
    "plugins":[
    [
      "@babel/plugin-transform-react-jsx",
      {
        "throwIfNamespace": false, 
        "runtime": "classic",
        "pragma":"dom"
      }
    ]
  ]
}

fs.readFile('./input.html', 'utf8' , (er, data) => {
    if(er) console.log(er);
    else{
        let code = data.trim();
        babel.transform(code,options,(er,res)=>{
            if(er){
                let content;
                if(er.reasonCode == 'UnwrappedAdjacentJSXElements') content = '//======= Please wrap all the elements into a single Parent';
                if(er.reasonCode == 'MissingClosingTagElement') content = `//======= found non-closing child element at line:${er.loc.line}`;
                else if(er.reasonCode == 'UnterminatedJsxContent') content = `//======= Please close the corresponding tag element at line:${er.loc.line}`;
                else content = `//======= ${er.reasonCode} at line:${er.loc.line}`;
                fs.writeFile('./output.js',content,err=>{
                    if(err) console.log(err);
                    else console.log('error occured when parsing. please check output.js')
                })
            }
            else{
                var ctag = Function("let EnglishData = `"+EnglishData+"`;"+`let dom = ${dom.toString()};return ${res.code}`)()
                let content = `//=============output generated at: ${Date()}\n\n\n${ctag}`
                fs.writeFile('./output.js',content,er=>{
                    if(er) console.log(er);
                    else console.log('output generated successfully. please check output.js')
                })
            }
        })
    }
})