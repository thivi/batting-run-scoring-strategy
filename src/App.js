import React, { useState, useEffect } from "react";
import Tree from "react-tree-graph";
import {
  Sidebar,
  Segment,
  Form,
  Button,
  Table,
  Grid,
  Label,
  Container,
  Header
} from "semantic-ui-react";

function App() {
  const [overs, setOvers] = useState(5);
  const [target, setTarget] = useState(8);
  const [overQuota, setOverQuota] = useState(1);
  const [path, setPath] = useState([]);
  const [maxRPO, setMaxRPO] = useState(2);
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
    return runs / sr;
  };

  const heuristic = (runs, pbowlers) => {
    let effectiveSR = 1;
    let index = 1;

    pbowlers.forEach(bowler => {
      if (overQuota !== bowler.overs) {
        effectiveSR += bowler.sr / (overQuota - bowler.overs);
        index++;
      }
    });
    const trailBy = target - runs;
    return trailBy / (effectiveSR / index);
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

  const traverseTree = tree => {
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
        const hCost = heuristic(runs.score, tempBowlers);
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

  const checkActiveNode = name => {
    if (path) {
      for (const p of path) {
        if (p.name === name) {
          return true;
        }
      }
    }
    return false;
  };

  const createTree = (start, overs, tree, name, score) => {
    for (let runs = 0; runs <= maxRPO; runs++) {
      name += "." + runs;
      score += runs;
      tree.push({
        name,
        score: score,
        runs: runs,
        gProps: {
          className: checkActiveNode(name) ? "selected" : "node"
        },
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

  const checkWon=()=>{
    return path[path.length - 1].score >= target;
  };

  const bowlersText = [];
  bowlersList.forEach((bowler, index) => {
    bowlersText.push(
      <Form.Group>
        <Form.Input
          type="text"
          label="Name"
          value={bowler.name}
          onChange={e => {
            let tempBowler = new Map(bowlersList);
            tempBowler.set(index, {
              ...tempBowler.get(index),
              name: e.target.value
            });
            setBowlersList(tempBowler);
          }}
        />
        <Form.Input
          type="text"
          value={bowler.sr}
          label="Strike Rate"
          onChange={e => {
            let tempBowler = new Map(bowlersList);
            tempBowler.set(index, {
              ...tempBowler.get(index),
              sr: e.target.value
            });
            setBowlersList(tempBowler);
          }}
        />
      </Form.Group>
    );
  });
  return (
    <Sidebar.Pushable
      as={Segment}
      style={{
        width: "100%",
        height: "100%",
        minHeight: "100vh"
      }}
    >
      <Sidebar
        as={Segment}
        icon="labeled"
        vertical
        visible={true}
        width="very wide"
        animation="push"
      >
        <Segment basic>
          <Form>
            <Form.Input
              type="text"
              label="Overs"
              value={overs}
              onChange={e => {
                setOvers(e.target.value);
              }}
            />
            <Form.Input
              type="text"
              label="Target"
              value={target}
              onChange={e => {
                setTarget(e.target.value);
              }}
            />
            <Form.Input
              type="text"
              label="Maximum RPO"
              value={maxRPO}
              onChange={e => {
                setMaxRPO(e.target.value);
              }}
            />
            {bowlersText}
            <Button
              primary
              onClick={() => {
                traverseTree(tree);
              }}
            >
              Bat!
            </Button>
          </Form>
        </Segment>
      </Sidebar>
      <Sidebar.Pusher as={Segment} basic>
        <Grid padded>
          <Grid.Row columns={2}>
            <Grid.Column width={8}>
              {path && path.length > 0 ? (
                <Table striped color="blue" collapsing textAlign="center">
                  <Table.Header>
                    <Table.Row>
                      <Table.HeaderCell>Over</Table.HeaderCell>
                      <Table.HeaderCell>Bowler</Table.HeaderCell>
                      <Table.HeaderCell>Runs Scored</Table.HeaderCell>
                      <Table.HeaderCell>Total Runs</Table.HeaderCell>
                    </Table.Row>
                  </Table.Header>
                  <Table.Body>
                    {path &&
                      path.map((node, index) => {
                        return (
                          <Table.Row key={index} columns={4}>
                            <Table.Cell>{parseInt(index + 1)}</Table.Cell>
                            <Table.Cell>
                              {bowlersList.get(combination[index]).name}
                            </Table.Cell>
                            <Table.Cell>
                              <Label color="blue" circular>
                                {node.runs}
                              </Label>
                            </Table.Cell>
                            <Table.Cell>
                              <Label color="green">{node.score}</Label>
                            </Table.Cell>
                          </Table.Row>
                        );
                      })}
                  </Table.Body>
                </Table>
              ) : null}
            </Grid.Column>
            <Grid.Column width={8} verticalAlign="middle" textAlign="left">
              {path && path.length > 0 ? (
                <Segment inverted color={checkWon()?"green":"red"} circular style={{ width: 175, height: 175 }}>
                  <Header as="h2">
                    {
                      checkWon()? "You Win!"
                      : "You lose!"}
                  </Header>
                </Segment>
              ) : null}
            </Grid.Column>
          </Grid.Row>
          <Grid.Row>
            <Segment
              color="blue"
              style={{
                overflow: "auto",
                width: "calc(100% - 500px)",
                height: "500px"
              }}
            >
              <Tree
                svgProps={{
                  className: "custom"
                }}
                animated
                labelProp="score"
                data={tree}
                height={2700}
                width={1500}
              />
            </Segment>
          </Grid.Row>
        </Grid>
      </Sidebar.Pusher>
    </Sidebar.Pushable>
  );
}

export default App;
