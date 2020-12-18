import {Injectable} from "@angular/core";
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Share, User } from './models';


@Injectable()
export class AuthenticationService{

    username = ''
    password = ''

    httpOptions = {
        headers: new HttpHeaders({'Content-Type': 'application/json'})
    };

    constructor(private http:HttpClient){}

    async getUser(user: User): Promise<User[]>{
        this.username = user['username']
        this.password = user['password']
        const res = await this.http.post<any>('/login', user ,this.httpOptions)
            .toPromise()
        console.log(res);
        return res as []
    }

    async upload(share: any): Promise<any>{
        return await this.http.post<any>('/share', share)
            .toPromise()
            .then((result)=>{
            }).catch((error)=>{
              console.log(error);
            })
    }

    getUserAndPassword() {
        return [this.username, this.password]
      }
}