import React from "react";
interface PicEditorProps {
  src: string;
}
export default class PicEditor extends React.Component<PicEditorProps> {
  private _canvas = document.createElement("canvas");
  private _ctx: CanvasRenderingContext2D;
  constructor(props: PicEditorProps) {
    super(props);
    this._ctx = this._canvas.getContext("2d") as CanvasRenderingContext2D;
  }
  render() {
    return (
      <div>
        <img src={this.props.src} onLoad={this.picLoaded} alt=""/>
      </div>
    );
  }
  picLoaded = e => {
    const img = e.target as HTMLImageElement;
    
  };
}
