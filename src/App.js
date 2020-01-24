import React, { useState, useEffect } from "react";
import Tree from "react-tree-graph";

function App() {
    const [overs, setOvers] = useState(5);
    const [target, setTarget] = useState(15);
    const [overQuota, setOverQuota] = useState(1);
    const [path, setPath] = useState([]);
    const [combination, setCombination] = useState([]);

    const bowlers = new Map();
    bowlers.set(1, { name: "Bowler1", sr: 20.8, overs: 0 });
    bowlers.set(2, { name: "Bowler2", sr: 30.8, overs: 0 });
    bowlers.set(3, { name: "Bowler3", sr: 29.8, overs: 0 });
    bowlers.set(4, { name: "Bowler4", sr: 40.8, overs: 0 });
    bowlers.set(5, { name: "Bowler5", sr: 8, overs: 0 });

    const [bowlersList, setBowlersList] = useState(bowlers);

    useEffect(() => {
        setOverQuota(overs / 5);
    }, [overs]);

    const cost = (runs, sr) => {
        return (runs) / (sr);
    };

    const heuristic = (runs,pbowlers) => {
        let effectiveSR = 1;
        let index = 1;

        pbowlers.forEach((bowler) => {
            if (overQuota !== bowler.overs) {
                effectiveSR += bowler.sr / (overQuota - bowler.overs);
                index++;
            }
        });
        const trailBy = target - runs;
        return (trailBy) / (effectiveSR/index);
    };

    const randomBowlingCombo = () => {
        const oversBowled = new Map();
        oversBowled.set(1, 0);
        oversBowled.set(2, 0);
        oversBowled.set(3, 0);
        oversBowled.set(4, 0);
        oversBowled.set(5, 0);

        const oversCombo = [];

        for (let over = 1; over < overs + 1; over++) {
            let bowler = 1;
            do {
                bowler = Math.floor(Math.random() * 5) + 1;
            } while (oversBowled.get(bowler) >= overQuota);

            oversCombo.push(bowler);
            oversBowled.set(bowler, oversBowled.get(bowler) + 1);
        }

        return oversCombo;
    };

    const traverseTree = (tree) => {
        const bowlingCombo = randomBowlingCombo();
        setCombination(bowlingCombo);
        const path = [];
        let treeToTraverse = { ...tree };
        let tempBowlers = new Map(bowlers);

        for (let over = 1; over < overs + 1; over++) {
            let minCost = -1;
            let minCostNode = null;
            let found = false;
            
            tempBowlers.set(bowlingCombo[over - 1], {
                ...tempBowlers.get(bowlingCombo[over - 1]),
                overs: parseInt(tempBowlers.get(bowlingCombo[over - 1]).overs + 1)
            });

            for (let runs of treeToTraverse.children) {
                if (target <= runs.score) {
                    path.push(runs);
                    found = true;
                    break;
                }
                const sr = bowlers.get(bowlingCombo[over - 1]).sr;

                const currCost = cost(runs.runs, sr);
                const hCost = heuristic(runs.score,tempBowlers);
                const totalCost = currCost + hCost;

                if (totalCost < minCost || minCost === -1) {
                    minCost = totalCost;
                    minCostNode = { ...runs };
                }
            }

            if (found) {
                break;
            }

            path.push(minCostNode);
            treeToTraverse = { ...minCostNode };
        }
        setPath(path);
    };

    const createTree = (start, overs, tree, name, score) => {
        for (let runs = 0; runs <= 2; runs++) {
            name += "." + runs;
            score += runs;
            tree.push({
                name,
                score: score,
                runs: runs,
                children: []
            });
            if (start !== overs) {
                createTree(start + 1, overs, tree[runs].children, name, score);
            } else {
                delete tree[runs].children;
            }
            score -= runs;
            let names = name.split(".");
            names.pop();
            name = names.join(".");
        }
    };

    let tree = {
        name: "parent",
        children: []
    };

    createTree(1, overs, tree.children, "", 0);
    const bowlersText = [];
    bowlersList.forEach((bowler,index) => {
        bowlersText.push(
            <div>
                <input
                    type="text"
                    value={bowler.name}
                    onChange={(e) => {
                        let tempBowler = new Map(bowlersList);
                        tempBowler.set(index, { ...tempBowler.get(index), name: e.target.value });
                        setBowlersList(tempBowler);
                    }}
                />
                <input
                    type="text"
                    value={bowler.sr}
                    onChange={(e) => {
                        let tempBowler = new Map(bowlersList);
                        tempBowler.set(index, { ...tempBowler.get(index), sr: e.target.value });
                        setBowlersList(tempBowler);
                    }}
                />
            </div>
        );
    })
    return (
        <div>
            <input
                type="text"
                value={overs}
                onChange={(e) => {
                    setOvers(e.target.value);
                }}
            />
            <input
                type="text"
                value={target}
                onChange={(e) => {
                    setTarget(e.target.value);
                }}
            />
            {bowlersText}
            <button
                onClick={() => {
                    traverseTree(tree);
                }}>
                Find Path!
            </button>
            {path &&
                path.map((node, index) => {
                    return (
                        <div key={index}>
                            <span>{"Over " + parseInt(index + 1) + " "}</span>
                            <span>{node.runs + " "}</span>
                            <span>{node.score}</span>
                            <span>{bowlersList.get(combination[index]).name}</span>
                        </div>
                    );
                })
            }
            <Tree data={tree} height={5000} width={1000}/>
        </div>
    );
}

export default App;
