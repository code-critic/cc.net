import { IAppUser } from './cc-api';

const fetchLoginRedirect = async () => {
    const response = await fetch("home/login");
    const data = await response.json();
    return data.redirect as string | undefined;
};

export const redirectToLogin = async (redirect?: string) => {
    const target = redirect || await fetchLoginRedirect();
    if (target) {
        (window as any).location.href = target;
    }
};

export const auth = () => {
    return new Promise((resolve, reject) => {
        if ((window as any).currentUser) {
            resolve((window as any).currentUser);
        }

        fetch("home/whoami")
            .then(response => {
                if (response.status === 200) {
                    response
                        .json()
                        .then((data: IAppUser) => {
                            (window as any).currentUser = data;
                            resolve((window as any).currentUser);
                        })
                } else {
                    if (response.status === 203) {
                        response
                        .json()
                        .then((data: any) => {
                            const { redirect } = data;
                            redirectToLogin(redirect);
                        })
                    } else {
                        console.log('auth error', (window as any).currentUser);
                        redirectToLogin();
                        reject();
                    }
                }
            })
            .catch(response => {
                debugger;
                console.log('auth error', (window as any).currentUser);
                redirectToLogin();
                reject();
            })
    });
}
