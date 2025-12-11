import mitt from 'mitt';

interface Events {
    [key: string | symbol]: any;
}

const emiter = mitt<Events>();

export default emiter;
