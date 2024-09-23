import React, {useEffect, useState} from "react";
import {Button, Form, Modal, Spin} from "antd";
import {InputItem} from "../../components/utils/InputUtils";
import {randomString} from "../../components/utils/strUtils";
import {Palm} from "../../gen/schema";
import {TimeIntervalItem, TimeUnit} from "../../components/utils/TimeInterval";
import {CodeViewer} from "../../components/utils/CodeViewer";
import {drawGraphByScriptTask} from "../../network/queryGraphAPI";
import {AsyncTaskViewer} from "../../components/descriptions/AsyncTask";


const LineGraphTmp = `g = graph.NewLineGraph()

// now = NowUnix()
// for i = 0; i < 50; i ++ {
//     g.AddPointValue("a1", now + i, i + 3)
//     g.AddPointValue("a2", now + i, i + 1)\t
// }

model, err = graph.CreateGraphModel(TASK_ID, "这是一个线图测试图例", g, TASK_ID)
if err != nil {
    log(f("创建图例失败：%v", err))
    return 1
}
SaveGraph(model)

`;

const PieGraphTmp = `g = graph.NewPieGraph()
// g.AddValue("a", randn(1, 85))
// g.AddValue("b", randn(1, 100))
// g.AddValue("c", randn(1, 100))
// g.AddValue("d", randn(1, 100))
// g.AddValue("e", randn(1, 100))
// g.AddValue("f", randn(1, 100))
// g.AddValue("g", randn(1, 100))
// g.AddValue("h", randn(1, 100))

model, err = graph.CreateGraphModel(TASK_ID, "饼图描述信息", g, TASK_ID)
if err != nil {
    log("failed: %s", err)
    return 1
}
SaveGraph(model)

`;

const RoseGraphTmp = `g = graph.NewNonutRoseGraph()
// g.AddValue("a", randn(1, 85))
// g.AddValue("b", randn(1, 100))
// g.AddValue("c", randn(1, 100))
// g.AddValue("d", randn(1, 100))
// g.AddValue("e", randn(1, 100))
// g.AddValue("f", randn(1, 100))
// g.AddValue("g", randn(1, 100))
// g.AddValue("h", randn(1, 100))

model, err = graph.CreateGraphModel(TASK_ID, "测试玫瑰图里描述信息", g, TASK_ID)
if err != nil {
    log("failed: %s", err)
    return 1
}
SaveGraph(model)

`;

const PunchCardGraphTmp = `g = graph.NewPunchCardGraph()
// for ai = 0; ai < 80; ai++ {
//     for bi = 0; bi < 7; bi ++ {
//         g.AddPointValue(f("a-%v", ai), f("b-%v", bi), randn(6, 100))
//     }
// }

model, err = graph.CreateGraphModel(TASK_ID, "测试一个打点图", g, TASK_ID)
if err != nil {
    log("failed: %s", err)
    return 1
}
SaveGraph(model)

`;

const RadiusGraphTmp = `
g = graph.NewRadialGraph()
//g.AddNode("1","node_1",1)
//g.AddNode("2","node_2",2)
//g.AddNode("3","node_3",3)

//g.SetEdgeWithValue("1","2",2)
//g.SetEdgeWithValue("1","3",3)
//g.SetEdgeWithValue("2","3",5)

model, err = graph.CreateGraphModel(TASK_ID, "测试一个辐射图", g, TASK_ID)
if err != nil {
    log("failed: %s", err)
    return 1
}
SaveGraph(model)
`;

const BarGraphTmp = `
g = graph.NewBarGraph()
for i = 0; i < 4; i ++ {
    g.AddElement(f("a-%v", i), randn(2, 14))
}

model, err = graph.CreateGraphModel("测试一个条形图", "测试信息", g, TASK_ID)
if err != nil {
    log(f("创建图例失败：%v", err))
    return 1
}
SaveGraph(model)
`;

export const CreateDrawScriptTask: React.FC = () => {
    const [loading, setLoading] = useState(false);
    const [defaultTaskId, setDefaultTaskId] = useState("");
    const [task, setTask] = useState<Palm.DrawGraphTask>({
        task_id: "", script: "", timeout_seconds: 10,
    });

    const resetDefaultTaskId = () => setDefaultTaskId(`draw-graph-script-task-[${randomString(5)}]`);


    useEffect(() => {
        resetDefaultTaskId()
    }, [])

    return <Spin spinning={loading}>
        <Form layout={"vertical"} onSubmitCapture={e => {
            e.preventDefault();

            let {task_id} = task;
            if (task_id === "") {
                task_id = defaultTaskId
            }
            drawGraphByScriptTask({...task, task_id}, () => {
                Modal.info({
                    width: "60%",
                    title: `异步任务「${task_id}」执行情况`,
                    content: <div>
                        <AsyncTaskViewer task_id={task_id}/>
                    </div>
                })
            }, () => {
                setTimeout(() => setLoading(false), 200)
                resetDefaultTaskId()
            })
        }}>
            <InputItem label={"任务 ID"} placeholder={defaultTaskId} value={task.task_id}
                       setValue={task_id => setTask({...task, task_id: task_id || ""})}
            />
            <TimeIntervalItem
                label={"超时时间"} defaultUnit={TimeUnit.Second} defaultValue={task.timeout_seconds}
                onChange={timeout_seconds => setTask({...task, timeout_seconds})}
            />
            <Form.Item label={"脚本内容"}>
                <CodeViewer value={task.script} setValue={script => setTask({...task, script})}/>
            </Form.Item>
            <Form.Item>
                <Button.Group>
                    <Button type={"primary"} htmlType={"submit"}>尝试绘图</Button>
                    <Button onClick={e => setTask({...task, script: LineGraphTmp})}>使用线图模版</Button>
                    <Button onClick={e => setTask({...task, script: RoseGraphTmp})}>使用玫瑰图模版</Button>
                    <Button onClick={e => setTask({...task, script: PieGraphTmp})}>使用饼图模版</Button>
                    <Button onClick={e => setTask({...task, script: PunchCardGraphTmp})}>使用打点图模版</Button>
                    <Button onClick={e => setTask({...task, script: RadiusGraphTmp})}>使用辐射图模版</Button>
                    <Button onClick={e => setTask({...task, script: BarGraphTmp})}>使用柱状图模版</Button>
                </Button.Group>
            </Form.Item>
        </Form>
    </Spin>
};