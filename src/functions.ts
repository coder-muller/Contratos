const BASE_URL = 'http://localhost:4500';

export async function sendGet(rota: string): Promise<any> {
    try {
        const response = await fetch(`${BASE_URL}${rota}`, {
            headers: {
                'Content-Type': 'application/json',
            },
            method: 'GET',
        });

        if (response.ok) {
            const data = await response.json();
            return data;
        } else {
            console.error('Erro no retorno do servidor!');
            return null;
        }
    } catch (error) {
        console.error('Erro na conexão com o servidor!', error);
        return null;
    }
}

export async function sendPost(rota: string, body: any): Promise<any> {
    try {
        const response = await fetch(`${BASE_URL}${rota}`, {
            headers: {
                'Content-Type': 'application/json',
            },
            method: 'POST',
            body: JSON.stringify(body),
        });

        if (response.ok) {
            const data = await response.json();
            return data;
        } else {
            console.error('Erro no retorno do servidor!');
            return null;
        }
    } catch (error) {
        console.error('Erro na conexão com o servidor!', error);
        return null;
    }
}

export async function sendPut(rota: string, body: any): Promise<any> {
    try {
        const response = await fetch(`${BASE_URL}${rota}`, {
            headers: {
                'Content-Type': 'application/json',
            },
            method: 'PUT',
            body: JSON.stringify(body),
        });

        if (response.ok) {
            const data = await response.json();
            return data;
        } else {
            console.error('Erro no retorno do servidor!');
            return null;
        }
    } catch (error) {
        console.error('Erro na conexão com o servidor!', error);
        return null;
    }
}

export async function sendDelete(rota: string, body: any): Promise<any> {
    try {
        const response = await fetch(`${BASE_URL}${rota}`, {
            headers: {
                'Content-Type': 'application/json',
            },
            method: 'DELETE',
            body: JSON.stringify(body),
        });

        if (response.ok) {
            const data = await response.json();
            return data;
        } else {
            console.error('Erro no retorno do servidor!');
            return null;
        }
    } catch (error) {
        console.error('Erro na conexão com o servidor!', error);
        return null;
    }
}

export function parseDate(dateStr: string): Date | null {
    const regex = /^(\d{2})\/(\d{2})\/(\d{4})$/;
    const match = dateStr.match(regex);
    if (!match) return null;
    const [, dayStr, monthStr, yearStr] = match;
    const day = Number(dayStr);
    const month = Number(monthStr);
    const year = Number(yearStr);
    const date = new Date(year, month - 1, day);
    if (date.getFullYear() === year &&
        date.getMonth() === month - 1 &&
        date.getDate() === day) {
        return date;
    }
    return null;
}

export function convertIsoToDate(isoDateStr: string): string {  
    const date = new Date(isoDateStr);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
}

