import { Header } from "@/components/ui/header";

const BoardView = async ({ params }: { params: { boardId: string } }) => {
    return (
        <div className="w-full">
            <Header as="h2" size="h2">
                Board
            </Header>
            Board {params.boardId}
        </div>
    );
};

export default BoardView;
