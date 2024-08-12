import os
import pathlib
import secrets
from flask import Flask, abort, render_template, request, jsonify, redirect , session,json
from flask_cors import CORS 
import json
from google.oauth2 import id_token
from google_auth_oauthlib.flow import Flow
from pip._vendor import cachecontrol
import google.auth.transport.requests
import base64
import io
from flask_cors import cross_origin
from PIL import Image, PngImagePlugin
import requests
import base64
from PIL import Image
from werkzeug.utils import secure_filename

app = Flask(__name__, static_url_path='/static')
CORS(app)
app.config['SECRET_KEY'] = 'super secret key'
token = secrets.token_hex(16)

os.environ["OAUTHLIB_INSECURE_TRANSPORT"] = "1"

GOOGLE_CLIENT_ID = "268604835504-1tci623hh24477v4q3jog0kdipipca8u.apps.googleusercontent.com"
client_secrets_file = os.path.join(pathlib.Path(__file__).parent, "client_secret.json")
IMG_FOLDER = os.path.join("static", "IMG-Input")
IMG_Out_FOLDER = os.path.join("static", "IMG-Out")
app.config["UPLOAD_FOLDER"] = IMG_Out_FOLDER
app.config["UPLOAD_IMG-INPUT"] = IMG_FOLDER
flow = Flow.from_client_secrets_file(
    client_secrets_file=client_secrets_file,
    scopes=["https://www.googleapis.com/auth/userinfo.profile", "https://www.googleapis.com/auth/userinfo.email", "openid"],
    redirect_uri="http://127.0.0.1:5000/callback"
)




#homepage
@app.route('/TxtPage')
def TxtPage():
    
    return render_template('TxtPage.html')

@app.route('/ImgPage')
def ImgPage():
    
    return render_template('ImgPage.html')

#login
@app.route("/")
def login():
    return render_template("login.html")
#about
@app.route('/about')
def about():
    return render_template('about.html')

@app.route("/login_google",methods=['POST'])
def login_google():
    authorization_url, state = flow.authorization_url()
    session["state"] = state
    return redirect(authorization_url)


        

@app.route('/ImgTwoImgApi' , methods=['GET', 'POST'])
def ImgTwoImgApi():
    if request.method == 'POST':
        if 'file' in request.files:
            file = request.files['file']
            filename = secure_filename(file.filename)
            print(file)
            # Here you should save the file
            file.save("static\IMG-Input"+filename)
            with open('static\IMG-Input'+filename, 'rb') as image_file:
                base64_bytes = base64.b64encode(image_file.read()).decode('utf-8')  
                print(base64_bytes)
                base64_str = str(base64_bytes)
                
            url = "http://localhost:7860"
            payload = json.dumps({
                "init_images": [base64_str], 
                "prompt": request.form.get("english-prompt"),
                "negative_prompt": request.form.get("out-neprompt"),
                "sampler_name":  request.form.get("method-type"),
                "steps": request.form.get("step-value"),
                "cfg_scale": request.form.get("cfg-value"),
                "height": request.form.get("height"),
                "width":  request.form.get("width") ,
                "seed": request.form.get("seed"),
            # "seed": 5,
            })
            headers = {
            'Content-Type': 'application/json'
            }
            print(payload)
        
            response = requests.request("POST",url=f'{url}/sdapi/v1/img2img', data=payload)
            print(response.text)
            r = response.json()      
            print(r)
            for i in r ['images']:
                image = Image.open(io.BytesIO(base64.b64decode(i.split(",",1)[0])))

                png_payload = {
                    "image": "data:image/png;base64," + i
                }
                response2 = requests.post(url=f'{url}/sdapi/v1/png-info', json=png_payload)

                pnginfo = PngImagePlugin.PngInfo()
                pnginfo.add_text("parameters", response2.json().get("info"))

                image.save('static\IMG-Out\PictureOut2.png', pnginfo=pnginfo)
               
            print(response.content)

            genImage = os.path.join(app.config["UPLOAD_FOLDER"], "PictureOut2.png") 
            UploadImage = os.path.join(app.config["UPLOAD_IMG-INPUT"], filename)
        return render_template('ImgPage.html', user_image=UploadImage,result_image = genImage)
        

    return 'No file uploaded'
# @app.route('/uploads/<filename>')
# def upload(filename):
#     return send_from_directory(app.config['UPLOAD_PATH'], filename)


@app.route('/TxtTwoImageApi', methods=['GET', 'POST'])
def TxtTwoImageApi():
    import requests
    import json
    if request.method == 'POST':
            url = "http://localhost:7860"
            payload = json.dumps({
                "prompt": request.form.get("english-prompt"),
                "negative_prompt": request.form.get("out-neprompt"),
            "sampler_name":  request.form.get("method-type"),
                "steps": request.form.get("step-value"),
                "cfg_scale": request.form.get("cfg-value"),
                "height": request.form.get("height"),
                "width":  request.form.get("width") ,
                "seed": request.form.get("seed"),
            # "seed": 5,
            })
            headers = {
            'Content-Type': 'application/json'
            }
            print(payload)
        
            response = requests.request("POST",url=f'{url}/sdapi/v1/txt2img', data=payload)
            print(response.text)
            r = response.json()      
            print(r)
            for i in r ['images']:
                image = Image.open(io.BytesIO(base64.b64decode(i.split(",",1)[0])))

                png_payload = {
                    "image": "data:image/png;base64," + i
                }
                response2 = requests.post(url=f'{url}/sdapi/v1/png-info', json=png_payload)

                pnginfo = PngImagePlugin.PngInfo()
                pnginfo.add_text("parameters", response2.json().get("info"))

                image.save('static\IMG-Out\PictureOut.png', pnginfo=pnginfo)
               
            print(response.content)

            genImage = os.path.join(app.config["UPLOAD_FOLDER"], "PictureOut.png")
    return render_template('TxtPage.html', result_image=genImage)


@app.route("/callback")
def callback():
    flow.fetch_token(authorization_response=request.url)

    if not session["state"] == request.args["state"]:
        abort(500)  # State does not match!

    credentials = flow.credentials
    request_session = requests.session()
    cached_session = cachecontrol.CacheControl(request_session)
    token_request = google.auth.transport.requests.Request(session=cached_session)

    id_info = id_token.verify_oauth2_token(
        id_token=credentials._id_token,
        request=token_request,
        audience=GOOGLE_CLIENT_ID
    )

    session["google_id"] = id_info.get("sub")
    session["name"] = id_info.get("name")
    session["email"] = id_info.get("email")
    session["role"] = "turtle"
    print(session["google_id"],session["name"],session["email"],session["role"])

    return redirect("/TxtPage")


if __name__ == '__main__':
    app.run(debug=True)
    app.secret_key = 'super secret key'

