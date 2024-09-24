const BASE_URL = 'http://localhost:4567';

interface DataItem {
    id: string;
    [key: string]: any; // Isso permite outros campos dinâmicos
  }
  

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

export function isValidDate(dateStr: string): boolean {
    const regex = /^(\d{2})\/(\d{2})\/(\d{4})$/;
    const match = dateStr.match(regex);
    if (!match) return false;
    const [_, day, month, year] = match.map(Number);
    const date = new Date(year, month - 1, day);
    return date.getFullYear() === year &&
        date.getMonth() === month - 1 &&
        date.getDate() === day;
}

export function converterParaNumero(valorTexto: string): string {
    let valorfinal = valorTexto.replace('R$', '').trim();
    valorfinal = valorfinal.replace('.', '');
    valorfinal = valorfinal.replace(',', '.');
    return valorfinal;
}

export function floatParaInput(valorTexto: string): string {
    let valorFloat = valorTexto.toString().replace('.', ',');
    return valorFloat;
}

export function getNextMonthDate(day: number): Date {
    const today = new Date();
    const currentMonth = today.getMonth();
    const nextMonth = currentMonth === 11 ? 0 : currentMonth + 1;
    const nextMonthYear = currentMonth === 11 ? today.getFullYear() + 1 : today.getFullYear();
    const nextMonthDate = new Date(nextMonthYear, nextMonth, day);
    return nextMonthDate;
}

export async function getDataFromId(id: string, route: string, fieldName: string): Promise<string> {
    const response: DataItem[] = await sendGet(route); // Use o tipo DataItem[]
    const data = response.find((item: DataItem) => item.id === id);
    
    if (data && fieldName in data) {
        return String(data[fieldName]);
    }
    return 'erro'; 
}

export async function getIdFromData(data: any, fieldName: string, route: string): Promise<string> {
    const response: DataItem[] = await sendGet(route); // Use o tipo DataItem[]
    const id = response.find((item: DataItem) => item[fieldName] === data);
    
    if (id) {
        return String(id.id);
    }   
    return 'erro'; 
}






