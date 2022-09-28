import { UsuarioService } from './services/usuario.service';
import { Component, ElementRef, OnInit, ViewChild, AfterViewInit, Renderer2, ChangeDetectorRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { ColumnMode } from '@swimlane/ngx-datatable';
import * as OnBoarding from '../../../../assets/js/incode-sdk.js';

declare var OnBoarding: any;

declare var MediaRecorder: any;

@Component({
  selector: 'app-usuarios',
  templateUrl: './usuarios.component.html',
  styleUrls: ['./usuarios.component.scss']
})
export class UsuariosComponent implements OnInit, AfterViewInit {

  /********WEB RTC PARA GRABAR VIDEO****** */
  @ViewChild('recordedVideo') recordVideoElementRef: ElementRef;
  @ViewChild('video') videoElementRef: ElementRef;
  @ViewChild('cameracontainer') cameracontainer: ElementRef;
  @ViewChild('div', { static: false }) div: ElementRef;

  container = document.getElementById("cameracontainer");
  //cameracontainer :any
  videoElement: HTMLVideoElement;
  recordVideoElement: HTMLVideoElement;
  mediaRecorder: any;
  recordedBlobs: Blob[];
  isRecording: boolean = false;
  downloadUrl: string;
  stream: MediaStream;
  public muestraBtnIncode = true;
  public procesoFinalizado = false;
  public _front: any = {};
  public _back: any;
  public _selfie: any =
    {
      faceMatch: ""
    };
  public _processId: any;
  public _processFace: any = {
    faceMatch: false,
    age: 0
  };
  public _dataOCR: any = {};

  validationForm1: FormGroup;
  isForm1Submitted: Boolean;
  public session: any
  public onBoarding

  /************PROPIEDADES PARA EL MODAL**********/
  @ViewChild('lgModal') lgModal: any;
  currentModal: NgbModalRef;
  title = 'Agregar'

  /********PROPPIEDAD PARA LA TABLA******** */
  loadingIndicator = true;
  reorderable = true;
  ColumnMode = ColumnMode;
  rows = [];
  constructor(
    private modalService: NgbModal,
    public formBuilder: FormBuilder,
    private _usuarioService: UsuarioService,
    private renderer: Renderer2,
    private el: ElementRef,
    private cd: ChangeDetectorRef
  ) { }


  ngAfterViewInit(): void { }

  ngOnInit(): void {
    // this.initMediaDevices();
    //this.listenerMati();
    //this.createOnBoarding();

  }

  setMuestraBtnIncode() {
    this.muestraBtnIncode = true;
  }

  get DataOCR() {
    return this._dataOCR;
  }

  async app() {
    try {
      this.cameracontainer.nativeElement.innerHTML = "";
      //PARA CREAR EL CONTENEDOR EN TIEMPO DE EJECUCION
      //this.cameracontainer = this.renderer.createElement('div');
      //const text = this.renderer.createText('Inserted at bottom');
      //this.renderer.appendChild(this.el.nativeElement, this.cameracontainer);
      this.procesoFinalizado = false;
      this.muestraBtnIncode = false;
      this.onBoarding = null;
      this.session = null;
      this.onBoarding = this.createOnBoarding(); // initialize the instance
      this.cameracontainer.nativeElement.style.display = 'block';

      this.cameracontainer.nativeElement.innerHTML = `<p>Warming up...</p>`;
      await this.onBoarding.warmup();
      this.cameracontainer.nativeElement.innerHTML = `<p>Creating session...</p>`;
      this.session = await this.createSession();
      console.log({ ...this.session });

      await this.onBoarding
        .sendGeolocation({ token: this.session.token })
        .catch(console.log);
      this.cameracontainer.nativeElement.innerHTML = "";
      this.renderFrontTutorial();
    } catch (e) {
      this.setMuestraBtnIncode()
      console.dir(e);
      this.cameracontainer.nativeElement.innerHTML = `<p>Something went wrong</p>`;
      throw e;
    }
  }

  async createSession() {
    try {
      return await this.onBoarding.createSession("ALL");
    } catch (err) {
      this.setMuestraBtnIncode()
      console.log(err);
      this.showError(err);
    }
  }

  showError(error = "") {
    //alert("Some error: " + JSON.stringify(error));
    console.log("Some error: ", JSON.stringify(error));
    this.setMuestraBtnIncode()
  }

  async renderFrontTutorial() {
    this.onBoarding.renderFrontTutorial(this.cameracontainer.nativeElement, {
      onSuccess: () => {
        this.renderFrontIDCamera();
        console.log("todo bien");

      },
      noWait: true,
      onError: (error) => {
        this.setMuestraBtnIncode()
      }
    });
    // then you can close the SDK from your code

  }

  renderFrontIDCamera() {
    try {
      this.onBoarding.renderCamera("front", this.cameracontainer.nativeElement, {
        onSuccess: (result) => {
          this.renderBackIDCamera()
        },
        onError: (error) => {
          this.showError(error)
          this.setMuestraBtnIncode()
        },
        token: this.session,
        numberOfTries: -1,
        noWait: true,
      });



    } catch (err) {
      console.log(err);
      this.setMuestraBtnIncode()
    }
  }

  renderBackIDCamera() {
    this.onBoarding.renderCamera("back", this.cameracontainer.nativeElement, {
      onSuccess: (back) => {
        //this._back ={...back};
        //console.log("_back" ,this._back);
        this.processId()
      },
      onError: this.showError,
      token: this.session,
      numberOfTries: -1,
    });
  }


  processId() {
    this.cameracontainer.nativeElement.innerHTML = "<p>Loading...</p>";
    this.onBoarding.processId({ token: this.session.token }).then((data) => {
      this._processId = data;
      //await this.renderPoa();
      this.renderSelfieCamera();
    });
  }

  async renderPoa() {
    await this.onBoarding.renderCamera("document", this.cameracontainer.nativeElement, {
      onSuccess: async (document) => { console.log("document", document); await this.renderSelfieCamera },
      onError: (error) => { this.showError(error) },
      numberOfTries: 3,
      onLog: () => { },
      token: this.session,
      permissionBackgroundColor: "#696969",
      sendBase64: false,
      nativeCamera: false,
    });
  }

  renderSelfieCamera() {
    this.onBoarding.renderCamera("selfie", this.cameracontainer.nativeElement, {
      onSuccess: (selfie) => {
        this.logger("selfie", selfie);
        this._selfie.faceMatch = selfie?.faceMatch
        this.cameracontainer.nativeElement.innerHTML = "Analizando Selfie";
        this.renderFaceMatch();
      },
      onError: (error) => { this.showError(error) },
      token: this.session,
      numberOfTries: 3,
    });
  }

  renderFaceMatch() {
    this.onBoarding.processFace({ token: this.session.token }).then((processFace) => {
      this.cameracontainer.nativeElement.innerHTML = "Analizando Coincidencia";
      this._processFace = processFace;
      this.getOcrData();

    }).catch((err) => this.logger("renderFaceMatch", err));
  }

  getOcrData() {
    this.cameracontainer.nativeElement.innerHTML = "Onteniendo informacion...";
    this.onBoarding.ocrData({ token: this.session.token }).then((ocrData) => {
      try {
        this.cameracontainer.nativeElement.innerHTML = "informacion del OCR ...";
        this._dataOCR = ocrData;
        this.renderSignature();
      } catch (err) {
        alert("error" + JSON.stringify(err));
      }

    }).catch((err) => {
      this.logger("getOcrData", err)
      this.setMuestraBtnIncode();
    });
  }


  renderSignature() {
    this.onBoarding.renderSignature(this.cameracontainer.nativeElement, {
      onSuccess:(renderSignature) => {
        console.log("renderSignature", renderSignature);
        this.setProcesoFinalizado();
      },
      token: this.session.token,
    });
  }

  public setProcesoFinalizado() {
    this.procesoFinalizado = true;
    this.setMuestraBtnIncode();
    this.cameracontainer.nativeElement.innerHTML = "Proceso finalizado";
    this.cd.detectChanges();
  }


  renderVideoConference() {
    this.onBoarding.renderConference(
      this.cameracontainer,
      {
        token: this.session,
        showOTP: true,
      },
      {
        onSuccess: (status) => {
          console.log("success");
          this.cameracontainer.nativeElement.innerHTML = `<p>Success with status ${status}</p>`;
        },
        onError: (error) => {
          console.log("error", error);
          this.showError(error),
            this.cameracontainer.nativeElement.innerHTML = `<p>Success with status ${error}</p>`;
        },
        onLog: (...params) => console.log("onLog", ...params),
      }
    );
  }


  createOnBoarding() {
    try {
      const apiURL = 'https://demo-api.incodesmile.com/';
      const clientId = '5mf615';
      return OnBoarding.create({
        clientId: clientId,
        apiURL: apiURL,
        theme: {
          // main: "",
          // mainButton: {
          //   borderRadius: "",
          //   color: "",
          //   border: "",
          // },
        },
      });
    } catch (Err) {
      console.log({ Err });

    }
  }


  initMediaDevices() {
    navigator.mediaDevices
      .getUserMedia({
        video: {
          width: 360
        }
      })
      .then(stream => {
        this.videoElement = this.videoElementRef.nativeElement;
        this.recordVideoElement = this.recordVideoElementRef.nativeElement;

        this.stream = stream;
        this.videoElement.srcObject = this.stream;
      }).catch((error) => {
        this.logger("initMediaDevices", error)
      });

  }

  startRecording() {
    this.recordedBlobs = [];
    let options: any = { mimeType: 'video/webm' };

    try {
      this.mediaRecorder = new MediaRecorder(this.stream, options);
    } catch (error) {
      this.logger("startRecording", error)
    }

    this.mediaRecorder.start(); // collect 100ms of data
    this.isRecording = !this.isRecording;
    this.onDataAvailableEvent();
    this.onStopRecordingEvent();
  }

  stopRecording() {
    this.mediaRecorder.stop();
    this.isRecording = !this.isRecording;
    console.log('Recorded Blobs: ', this.recordedBlobs);
  }

  playRecording() {
    try {
      if (!this.recordedBlobs || !this.recordedBlobs.length) {
        console.log('cannot play.');
        this.logger("playRecording", 'cannot play.')
        return;
      }
      this.recordVideoElement.play();

    } catch (err) {
      this.logger("playRecording catch", err)
    }
  }

  onDataAvailableEvent() {
    try {
      this.mediaRecorder.ondataavailable = (event: any) => {
        if (event.data && event.data.size > 0) {
          this.recordedBlobs.push(event.data);
        }
      };
    } catch (error) {
      this.logger("onDataAvailableEvent", error)
      console.log(error);
    }
  }

  onStopRecordingEvent() {
    try {
      this.mediaRecorder.onstop = (event: Event) => {
        const videoBuffer = new Blob(this.recordedBlobs, {
          type: 'video/webm'
        });
        this.downloadUrl = window.URL.createObjectURL(videoBuffer); // you can download with <a> tag
        this.recordVideoElement.src = this.downloadUrl;
      };
    } catch (error) {
      console.log(error);
      this.logger("onStopRecordingEvent", error)
    }
  }

  logger(nombreFuncion, mensaje) {
    console.log(mensaje);
    //alert(nombreFuncion +" "+ JSON.stringify(mensaje));
  }

  listenerMati() {
    //document.getElementById("mati_button").click();
    const button = document.getElementById("mati_button");
    // setup callbacks
    // Message when a flow starts
    button.addEventListener("mati:loaded", (detail) => {
      console.log(":::::::::::::Started Flow:::::::::::::", detail);
    });

    // Call to receive Identity after finishing the flow and clicking on the DONE button
    button.addEventListener("mati:userFinishedSdk", (detail) => {
      console.log(":::::::::::::Finished Flow:::::::::::::", detail);
      // redirect to another page after finishing the verification
      //window.location.href = "https://www.getmati.com";
    });
    // Call to receive message of flow not finished
    button.addEventListener("mati:exitedSdk", (detail) => {
      console.log(":::::::::::::Abandoned Flow::::::::::::::", detail);
    });
  }



}
