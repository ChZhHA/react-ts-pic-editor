import React, { MouseEvent as ME } from "react";
interface PicEditorProps {
  src: string;
}
export default class PicEditor extends React.Component<PicEditorProps, any> {
  private _canvas = document.createElement("canvas");
  private _ctx: CanvasRenderingContext2D;
  state = {
    width: 0,
    height: 0,
    sx: 0,
    sy: 0
  };
  constructor(props: PicEditorProps) {
    super(props);
    this._ctx = this._canvas.getContext("2d") as CanvasRenderingContext2D;
    const classTag = document.createElement("style");
    classTag.innerHTML = `
      .pic-editor-container{
        position:relative;
        user-select:none;
      }
      .control-point{
        position:absolute;
        width:10px;
        height:10px;
        transform:translate(-50%,-50%);
        border:2px solid #bae7ff;
        border-radius:0;
        background:#91d5ff33;
        cursor:pointer;
        transition:all 0.5s ease;
      }
      .control-point:hover{
        border-radius:50%;
        background:#91d5ffaa;
        border-color:#40a9ff;
      }
    `;
    document.head.appendChild(classTag);
  }
  render() {
    const { width, height, sx, sy } = this.state;
    return (
      <div className="pic-editor-container">
        <img
          src={this.props.src}
          onLoad={this.picLoaded}
          alt=""
          draggable={false}
          style={{
            position: "absolute",
            left: sx,
            top: sy
          }}
        />
        <div style={{ position: "absolute", left: 0, top: 0 }}>
          {this.viewControlPoints()}
        </div>
      </div>
    );
  }
  _changeTarget = {
    x: 0,
    y: 0,
    width: 0,
    height: 0,
    anchorX: 0,
    anchorY: 0
  };
  _lastMousePos = {
    x: 0,
    y: 0
  };
  onMouseDown = (event: ME) => {
    const { clientX, clientY, target } = event;
    const { row, col } = (target as HTMLDivElement).dataset;
    this._lastMousePos = { x: clientX, y: clientY };
    const changeTarget = {
      x: 0,
      y: 0,
      width: 0,
      height: 0,
      anchorX: 0,
      anchorY: 0
    };
    switch (row) {
      case "0":
        changeTarget.y = -0.5;
        changeTarget.height = -1;
        break;
      case "2":
        changeTarget.y = 0.5;
        changeTarget.height = 1;
    }
    this._changeTarget = changeTarget;
    document.addEventListener("mousemove", this.onMouseMove);
    document.addEventListener("mouseup", this.onMouseUp);
  };
  onMouseMove = (event: MouseEvent) => {
    const { clientX, clientY } = event;
    const dx = clientX - this._lastMousePos.x;
    const dy = clientY - this._lastMousePos.y;

    let { sx, sy, width, height } = this.state;
    sx += this._changeTarget.x * dx;
    width += this._changeTarget.x * dx;
    sy += this._changeTarget.y * dy;
    height += this._changeTarget.y * dy;
    
    this.setState({ sx, sy, width, height });

    this._lastMousePos = { x: clientX, y: clientY };
  };
  onMouseUp = (event: MouseEvent) => {
    document.removeEventListener("mousemove", this.onMouseMove);
    document.removeEventListener("mouseup", this.onMouseUp);
  };
  viewControlPoints = () => {
    const { width, height } = this.state;
    const pointArr: any[] = [];
    for (let i = 0; i < 3; i++) {
      const y = (i * height) / 2;
      for (let j = 0; j < 3; j++) {
        const x = (j * width) / 2;
        pointArr.push(
          <div
            className="control-point"
            onMouseDown={this.onMouseDown}
            data-row={i}
            data-col={j}
            style={{
              left: x,
              top: y
            }}
            key={`${i}-${j}`}
          />
        );
      }
    }
    return pointArr;
  };
  picLoaded = e => {
    const img = e.target as HTMLImageElement;
    const { naturalWidth: width, naturalHeight: height } = img;

    this.setState({ width, height });
  };
}
