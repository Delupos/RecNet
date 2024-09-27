<template>
    <q-page>
        <div v-if="createOrLogin">
            <h5 style="margin-bottom: 10px;">Login</h5>
            <q-input filled v-model="login_email" label="E-Mail"  />
            <q-input filled v-model="login_passwort" label="Passwort"  :type="isPwd ? 'password' : 'text'" @keydown.enter.prevent="checkLogin()">
                <template v-slot:append>
                    <q-icon
                        :name="isPwd ? 'visibility_off' : 'visibility'"
                        class="cursor-pointer"
                        @click="isPwd = !isPwd"
                    />
                </template>
            </q-input>
            <q-btn class="loginPageBtn" color="primary" @click="checkLogin()" label="Login" />
            <q-btn class="loginPageBtn" color="primary" @click="createOrLogin = !createOrLogin" label="Konto erstellen?"/>
        </div>
        
        <div v-else>
            <h5 style="margin-bottom: 10px;">Create Account</h5>
            <q-input filled v-model="create_vorname" label="Vorname"  />
            <q-input filled v-model="create_nachname" label="Nachname"  />
            <q-input filled v-model="create_email" label="E-Mail"  />
            <q-input filled v-model="create_passwort" label="Passwort"  :type="isPwd ? 'password' : 'text'">
                <template v-slot:append>
                    <q-icon
                        :name="isPwd ? 'visibility_off' : 'visibility'"
                        class="cursor-pointer"
                        @click="isPwd = !isPwd"
                    />
                </template>
            </q-input>
            <q-btn class="loginPageBtn" color="primary" label="Account erstellen" @click="createAccount()"/>
            <q-btn class="loginPageBtn" color="primary" @click="createOrLogin = !createOrLogin" label="Haben Sie bereits ein Konto?"/>
        </div>
    </q-page>
</template>

<script>
import { defineComponent, ref } from 'vue';
import { useQuasar } from 'quasar';
import { api } from 'src/boot/axios';
import { useRouter } from 'vue-router';

export default defineComponent({
    name: 'LoginPage',

    setup(){
        const create_vorname = ref('')
        const create_nachname = ref('')
        const create_email = ref('')
        const create_passwort = ref('')
        const login_email = ref('')
        const login_passwort = ref('')
        const isPwd = ref(true)
        const createOrLogin = ref(true)
        const $q = useQuasar()
        const router = useRouter()

        async function createAccount() {
            const fields = [create_vorname.value, create_nachname.value, create_email.value, create_passwort.value]

            if (fields.every(field => field !== '')) {
                
                const temp = {
                    vorname: create_vorname.value,
                    nachname: create_nachname.value,
                    email: create_email.value,
                    passwort: create_passwort.value
                }

                try {
                    await api.post('/createProfile' , temp)

                    create_vorname.value = ''
                    create_nachname.value = ''
                    create_email.value = ''
                    create_passwort.value = ''

                    $q.notify({
                        type: 'positive',
                        message: 'Ihr Account wurde erfolgreich erstellt!',
                        timeout: 2000
                    })

                } catch(err) {
                    console.log(err)
                    $q.notify({
                        type: 'negative',
                        message: 'Unbekannter Fehler beim erstellen!' + err,
                        timeout: 2000
                    })
                }
            } else {
                $q.notify({
                    type: 'negative',
                    message: 'Alle Felder müssen ausgefüllt sein!',
                    timeout: 2000
                })
            }
        }

        async function checkLogin(){
            const fields = [login_email.value, login_passwort.value]

            if (!fields.every(field => field !== '')){
                $q.notify({
                    type: 'negative',
                    message: 'Alle Felder müssen ausgefüllt sein!',
                    timeout: 2000
                })
    
            } else {
                
                try{
                    const result = await api.get(`/checkProfileForLogin/${login_email.value}?passwort=${login_passwort.value}`, 
                    {headers: {Authorization: localStorage.getItem("token")}})

                    $q.notify({
                        type: 'positive',
                        message: 'Login war erfolgreich!',
                        timeout: 2000
                    })

                    const jwtToken = result.data.data

                    localStorage.setItem("token", jwtToken)
                    
                    router.push('../')
    
                } catch (err) {
                    
                    if ("AxiosError" == err.name && 401 == err.status) {
                        router.push('/login')
                    }
                    
                    $q.notify({
                        type: 'negative',
                        message: 'Fehler beim einloggen!',
                        timeout: 2000
                    })
                }
            }

        }

        return {
            create_vorname,
            create_nachname,
            create_email,
            create_passwort,
            login_email,
            login_passwort,
            isPwd,
            createOrLogin,
            createAccount,
            checkLogin
        }
    }
})
</script>

<style>
.q-page {
    display: flex;
    justify-content: center;
    align-items: center;
}

div[v-if] {
    background-color: white;
    padding: 30px;
    border-radius: 15px;
    box-shadow: 0px 8px 15px rgba(0, 0, 0, 0.1);
    width: 100%;
    max-width: 400px;
    transition: transform 0.3s ease, opacity 0.3s ease;
}

.q-input {
    margin-bottom: 20px;
}

.q-input input {
    font-size: 16px;
    padding: 12px 15px;
    transition: border-color 0.2s;
}

.q-input .q-icon {
    color: #888;
}

.loginPageBtn {
    display: block;
    width: 100%;
    margin-bottom: 15px;
    font-size: 16px;
    padding: 12px;
    border-radius: 10px;
    transition: background-color 0.3s, transform 0.2s;
}

.loginPageBtn[color="primary"] {
    background-color: var(--q-primary);
    color: white;
    border: none;
}

.loginPageBtn[color="primary"]:hover {
    background-color: #0056b3;
    transform: translateY(-2px);
}

.loginPageBtn[color="primary"]:active {
    transform: translateY(0);
}

div[v-if], div[v-else] {
    opacity: 0;
    transform: scale(0.95);
    animation: fadeIn 0.5s forwards;
}

@keyframes fadeIn {
    to {
        opacity: 1;
        transform: scale(1);
    }
}

</style>