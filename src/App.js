import React from 'react';
import Tree from "react-tree-graph";
import './App.css';

function App() {

  const createTree=(start,overs, tree, name)=>{
    for (let runs=1; runs<5; runs++){
      name+="."+runs;
      tree.push({
        name,
        runs:runs,
        children:[]
      });
      if(start!==overs){
        createTree(start+1,overs,tree[runs-1].children,name);
      } else{
        delete tree[runs-1].children;
      }
      let names=name.split(".");
      names.pop();
      name=names.join(".");
    }
  };

  let tree={
    name:"parent",
    children:[]
  };

  createTree(1,1,tree.children,"");
  console.log(tree);
  return (
    <div>
      <Tree data={tree} width={800} height={1000}/>
    </div>
  );
}

export default App;
