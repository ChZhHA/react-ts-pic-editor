import React, { MouseEvent as ME } from "react";
interface PicEditorProps {
  src: string;
}
export default class PicEditor extends React.Component<PicEditorProps, any> {
  private _canvas = document.createElement("canvas");
  private _ctx: CanvasRenderingContext2D;
  originSize = {
    width: 0,
    height: 0
  };
  state = {
    width: 0,
    height: 0,
    sx: 0,
    sy: 0,
    anchorX: 0.5,
    anchorY: 0.5,
    rotate: 0
  };
  constructor(props: PicEditorProps) {
    super(props);
    this._ctx = this._canvas.getContext("2d") as CanvasRenderingContext2D;
    this.initCss();
  }
  render() {
    const { sx, sy, rotate } = this.state;
    return (
      <div className="pic-editor-container">
        <img
          src={this.props.src}
          onLoad={this.picLoaded}
          id="picEditorTarget"
          alt=""
          draggable={false}
          style={{
            position: "absolute",
            left: sx,
            top: sy,
            transform: `rotate(${rotate}deg) translate(-50%,-50%)`,
            transformOrigin: "left top"
          }}
        />
        <div
          style={{ position: "absolute", left: 0, top: 0 }}
          id="controlPointsCover"
        >
          {this.viewControlBorder()}
          {this.viewControlPoints()}
        </div>
        <div style={{ position: "absolute" }}>
          <button onClick={this.makeFile}>生成图片</button>
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
    anchorY: 0,
    row: "0",
    col: "0"
  };
  _lastMousePos = {
    x: 0,
    y: 0
  };
  onRotateStart = (event: ME) => {
    const { clientX, clientY } = event;
    this._lastMousePos = { x: clientX, y: clientY };
    document.addEventListener("mousemove", this.onRotating);
    document.addEventListener("mouseup", this.onRotateEnd);
  };
  realRotate = 0;
  onRotating = (event: MouseEvent) => {
    const { clientX, clientY } = event;
    const centerX = this.state.anchorX * this.state.width;
    const centerY = this.state.anchorY * this.state.height;

    const disX = this._lastMousePos.x - centerX;
    const disY = this._lastMousePos.y - centerY;

    const deltaX = this._lastMousePos.x - clientX;
    const deltaY = this._lastMousePos.y - clientY;

    const deltaPos = Math.hypot(deltaY, deltaX);
    const lastDeg = Math.atan2(disY, disX);
    const newDeg = Math.atan2(clientY - centerY, clientX - centerX);
    const deltaDeg = newDeg - lastDeg;
    let result = (this.realRotate + (deltaDeg * 180) / Math.PI + 360) % 360;
    this.realRotate = result;
    if (deltaPos < 3)
      for (let i = 0; i < 360; i += 45) {
        if (Math.abs(result - i) < 5) {
          result = i;
          break;
        }
      }
    this.setState({ rotate: result });
    this._lastMousePos = { x: clientX, y: clientY };
  };
  onRotateEnd = () => {
    document.removeEventListener("mousemove", this.onRotating);
    document.removeEventListener("mouseup", this.onRotateEnd);
    this.fitView();
  };
  onDragStart = (event: ME) => {
    const { clientX, clientY, target } = event;
    const { row, col } = (target as HTMLDivElement).dataset;
    this._lastMousePos = { x: clientX, y: clientY };
    const changeTarget = {
      x: 0,
      y: 0,
      width: 0,
      height: 0,
      anchorX: 0,
      anchorY: 0,
      row,
      col
    };
    switch (row) {
      case "0":
        changeTarget.y = -0.5;
        changeTarget.height = -1;
        break;
      case "2":
        changeTarget.y = 0.5;
        changeTarget.height = 1;
        break;
    }
    switch (col) {
      case "0":
        changeTarget.x = -0.5;
        changeTarget.width = -1;
        break;
      case "2":
        changeTarget.x = 0.5;
        changeTarget.width = 1;
        break;
    }
    if (row === "1" && col === "1") {
      changeTarget.anchorX = 1 / this.state.width;
      changeTarget.anchorY = 1 / this.state.height;
    }
    this._changeTarget = changeTarget;
    document.getElementById("controlPointsCover").className = "editing";
    document.getElementById(`point${row}-${col}`).className =
      "control-point active";
    document.addEventListener("mousemove", this.onDragging);
    document.addEventListener("mouseup", this.onDragEnd);
  };
  onDragging = (event: MouseEvent) => {
    const { clientX, clientY } = event;
    const dx = clientX - this._lastMousePos.x;
    const dy = clientY - this._lastMousePos.y;

    let { sx, sy, width, height, anchorY, anchorX } = this.state;
    sx += this._changeTarget.x * dx;
    width += this._changeTarget.width * dx;
    sy += this._changeTarget.y * dy;
    height += this._changeTarget.height * dy;
    anchorX += this._changeTarget.anchorX * dx;
    anchorY += this._changeTarget.anchorY * dy;

    this.setState({ sx, sy, width, height, anchorX, anchorY });

    this._lastMousePos = { x: clientX, y: clientY };
  };
  onDragEnd = (event: MouseEvent) => {
    document.removeEventListener("mousemove", this.onDragging);
    document.removeEventListener("mouseup", this.onDragEnd);
    document.getElementById("controlPointsCover").className = "";
    document.getElementById(
      `point${this._changeTarget.row}-${this._changeTarget.col}`
    ).className = "control-point";
  };
  viewControlBorder = () => {
    const { width, height } = this.state;
    return <div style={{ width, height }} className="control-border" />;
  };
  viewControlPoints = () => {
    const { width, height, anchorX, anchorY } = this.state;
    const pointArr: any[] = [];
    for (let i = 0; i < 3; i++) {
      const y = (i * height) / 2;
      for (let j = 0; j < 3; j++) {
        const x = (j * width) / 2;
        if (i === 1 && j === 1) {
          pointArr.push(
            <div
              style={{
                position: "absolute",
                left: width * anchorX,
                top: height * anchorY,
                transform: "translate(-50%,-50%)"
              }}
            >
              <svg
                viewBox="0 0 1024 1024"
                version="1.1"
                xmlns="http://www.w3.org/2000/svg"
                p-id="3391"
                width="50"
                height="50"
                className="rotate-bar"
                onMouseEnter={() => {
                  document.getElementById("rotateBar").style.fill = "#40a9ff";
                }}
                onMouseLeave={() => {
                  document.getElementById("rotateBar").style.fill = null;
                }}
                onMouseDown={this.onRotateStart}
              >
                <path
                  d="M928 704h-192c-17.066667 0-32 14.933333-32 32s14.933333 32 32 32h136.533333c-76.8 100.266667-196.266667 160-326.4 160-228.266667 0-413.866667-185.6-413.866666-416 0-17.066667-14.933333-32-32-32s-32 14.933333-32 32c0 264.533333 213.333333 480 477.866666 480 134.4 0 260.266667-57.6 349.866667-153.6v89.6c0 17.066667 14.933333 32 32 32s32-14.933333 32-32v-192c0-17.066667-14.933333-32-32-32zM546.133333 32C407.466667 32 281.6 91.733333 192 189.866667V96C192 78.933333 177.066667 64 160 64S128 78.933333 128 96v192c0 17.066667 14.933333 32 32 32h192c17.066667 0 32-14.933333 32-32s-14.933333-32-32-32h-132.266667c76.8-100.266667 196.266667-160 326.4-160C774.4 96 960 281.6 960 512c0 17.066667 14.933333 32 32 32S1024 529.066667 1024 512C1024 247.466667 810.666667 32 546.133333 32z"
                  fill="#bae7ff"
                  p-id="3392"
                  id="rotateBar"
                />
              </svg>

              <div
                className="control-point"
                data-row={i}
                data-col={j}
                onMouseDown={this.onDragStart}
                key={`${i}-${j}`}
                id={`point${i}-${j}`}
              />
            </div>
          );
        } else {
          pointArr.push(
            <div
              className="control-point"
              onMouseDown={this.onDragStart}
              data-row={i}
              data-col={j}
              style={{
                left: x,
                top: y
              }}
              key={`${i}-${j}`}
              id={`point${i}-${j}`}
            />
          );
        }
      }
    }
    return pointArr;
  };
  picLoaded = e => {
    const img = e.target as HTMLImageElement;
    const { naturalWidth: width, naturalHeight: height } = img;
    this.originSize = {
      width,
      height
    };
    this.setState({ width, height, sx: width / 2, sy: height / 2 });
  };
  fitView = () => {
    let { width, height, sx, sy, rotate } = this.state;
    const { width: oWidth, height: oHeight } = this.originSize;
    const points = [
      { x: sx, y: sy },
      { x: sx + oWidth, y: sy },
      { x: sx, y: sy + oHeight },
      { x: sx + oWidth, y: sy + oHeight }
    ];
    const cx = width / 2,
      cy = height / 2;
    const deltaAng = (rotate / 180) * Math.PI;
    const bbox = {
      left: Infinity,
      right: -Infinity,
      top: Infinity,
      bottom: -Infinity
    };
    for (let i = 0; i < 4; i++) {
      let { x, y } = points[i];
      const dis = Math.hypot(y - cy, x - cx);
      const ang = Math.atan2(y - cy, x - cx);
      const newX = Math.floor(Math.cos(ang + deltaAng) * dis + cx);
      const newY = Math.floor(Math.sin(ang + deltaAng) * dis + cy);
      points[i] = { x: newX, y: newY };
      bbox.left = Math.min(bbox.left, newX);
      bbox.top = Math.min(bbox.top, newY);
      bbox.right = Math.max(bbox.right, newX);
      bbox.bottom = Math.max(bbox.bottom, newY);
    }
    width = bbox.right - bbox.left;
    height = bbox.bottom - bbox.top;
    this.setState({
      width,
      height,
      sx: width / 2,
      sy: height / 2
    });
    // console.log(bbox, sx, sy, points);
  };
  makeFile = () => {
    const { width, height, sx, sy, anchorX, anchorY, rotate } = this.state;
    this._canvas.width = width;
    this._canvas.height = height;
    const { width: oWidth, height: oHeight } = this.originSize;
    this._ctx.translate(sx, sy);
    this._ctx.rotate((rotate / 180) * Math.PI);
    this._ctx.drawImage(
      document.getElementById("picEditorTarget") as HTMLImageElement,
      -oWidth / 2,
      -oHeight / 2
    );
    this._canvas.style.cssText = "position:absolute;bottom:20px";
    document.body.appendChild(this._canvas);
    this._canvas.toBlob(res => {
      console.log({
        data: res,
        anchorX,
        anchorY,
        rotate
      });
    });
  };
  initCss() {
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
      .control-point:hover,.control-point.active{
        border-radius:50%;
        background:#91d5ffaa;
        border-color:#40a9ff;
      }
      .editing .control-point{
        transition:none;
      }
      .control-border{
        position:absolute;
        border:1px solid #36cfc9;
      }
      .rotate-bar{
        position: absolute;
        left: 0;
        top: 0;
        transform: translate(-25.5px,-25px);
        transform-origin: 25.4px 25.4px;
        transition: all 0.5s ease;
      }
      .rotate-bar:hover{
        transform:  translate(-25.5px,-25px) rotate(-90deg);
      }
    `;
    document.head.appendChild(classTag);
  }
}
