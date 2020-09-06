export const auth = () => {
    return new Promise((resolve, reject) => {
        console.log("auth start");
        if ((window as any).currentUser) {
            console.log('auth end', (window as any).currentUser);
            resolve((window as any).currentUser);
        }

        console.log('auth fetch');
        fetch("home/whoami")
            .then(response => {
                if (response.ok) {
                    console.log('auth json');
                    response
                        .json()
                        .then(data => {
                            (window as any).currentUser = data;
                            console.log('auth end', (window as any).currentUser);
                            resolve((window as any).currentUser);
                        })
                } else {
                    console.log('auth error', (window as any).currentUser);
                    debugger;
                    (window as any).location.href = "https://flowdb.nti.tul.cz/auth/";
                    reject()
                }
            })
    });
}
