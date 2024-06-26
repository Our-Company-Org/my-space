import { useCallback, useRef, useState, useMemo, useEffect } from "react";
import {
	RenderHighlightsProps,
	RenderHighlightTargetProps,
} from "@react-pdf-viewer/highlight";
import {
	defaultLayoutPlugin,
	ToolbarProps,
} from "@react-pdf-viewer/default-layout";
import { Viewer } from "@react-pdf-viewer/core";
import { ImperativePanelGroupHandle, PanelGroup } from "react-resizable-panels";
import { ReactFlowProvider } from "reactflow";

import "@react-pdf-viewer/core/lib/styles/index.css";
import "@react-pdf-viewer/default-layout/lib/styles/index.css";
import { Sidebar } from "@/components/pdf/Sidebar";
import { Forest } from "@/components/pdf/Forest";
import { ResizableHandle, ResizablePanel } from "@/components/ui/resizable";
import FloatingProfiles from "@/components/pdf/FloatingProfiles";
import {
	renderHighlightTarget,
	renderHighlights,
} from "@/lib/highlight-plugins";
import { useAskHighlight } from "@src/context/ask-highlight-context";
import {
	AnnotatedPdfWithProfile,
	HighlightWithRelations,
	UserProfile,
} from "@src/lib/types";
import { clientApi } from "@src/trpc/react";
import readingIndicatorPlugin from "./ReadingIndicator";
import useClickWithoutDrag from "@/lib/use-click-without-drag";
const highlightPlugin = require("./highlight.js").highlightPlugin;

type Props = {
	annotatedPdfId: string;
	loadedSource: string;
	userId: string;
	userHighlights: HighlightWithRelations[];
	annotatedPdfsWithProfile: AnnotatedPdfWithProfile[];
	pdfBytes: number[];
	userProfiles: UserProfile[];
};

const ReadingViewer: React.FC<Props> = ({
	loadedSource,
	pdfBytes,
	userHighlights,
	userId,
	annotatedPdfId,
	annotatedPdfsWithProfile,
	userProfiles
}) => {
	const [friendHighlights, setFriendHighlights] = useState<
		HighlightWithRelations[]
	>([]);


	const {
		currentHighlight,
		selectHighlight,
		createAskHighlight,
		clearSelectedHighlight,
		setCurrentHighlight,
	} = useAskHighlight();

	const utils = clientApi.useUtils();

	const annotatedPdfResetHighlightsMutation =
		clientApi.annotatedPdf.resetHighlights.useMutation({
			onMutate: async () => {
				await utils.annotatedPdf.fetchAnnotatedPdf.cancel({
					userId: userId,
					source: loadedSource,
				});

				utils.annotatedPdf.fetchAnnotatedPdf.setData(
					{
						userId: userId,
						source: loadedSource,
					},
					(oldData) => {
						if (!oldData) return oldData;
						return {
							...oldData,
							highlights: [],
						};
					},
				);
			},
			onSuccess: (input) => {
				utils.annotatedPdf.fetchAnnotatedPdf.invalidate({
					userId: userId,
					source: loadedSource,
				});
			},
		});

	const deleteHighlightMutation =
		clientApi.highlight.deleteHighlight.useMutation({
			onMutate: async (newData) => {
				await utils.annotatedPdf.fetchAnnotatedPdf.cancel({
					userId: userId,
					source: loadedSource,
				});

				utils.annotatedPdf.fetchAnnotatedPdf.setData(
					{
						userId: userId,
						source: loadedSource,
					},
					(oldData) => {
						if (!oldData) return oldData;
						return {
							...oldData,
							highlights: highlights.filter(
								(highlight) => highlight.id != newData.highlightId,
							),
						};
					},
				);
			},
			onSuccess: (input) => {
				utils.annotatedPdf.fetchAnnotatedPdf.invalidate({
					userId: userId,
					source: loadedSource,
				});
			},
		});

	const editHighlightMutation = clientApi.comment.upsertComment.useMutation({
		onMutate: async (input) => {
			await utils.annotatedPdf.fetchAnnotatedPdf.cancel({
				userId: userId,
				source: loadedSource,
			});

			utils.annotatedPdf.fetchAnnotatedPdf.setData(
				{
					userId: userId,
					source: loadedSource,
				},
				(oldData) => {
					if (!oldData) return oldData;

					return {
						...oldData,
					};
				},
			);
		},
		onSuccess: (input) => {
			utils.annotatedPdf.fetchAnnotatedPdf.invalidate({
				userId: userId,
				source: loadedSource,
			});
		},
	});

	const highlights =
		clientApi.annotatedPdf.fetchAnnotatedPdf.useQuery({
			userId: userId,
			source: loadedSource,
		}).data?.highlights || userHighlights;

	const deleteHighlight = (highlightId: string) => {
		deleteHighlightMutation.mutate({ highlightId });
	};

	const editHighlight = async ({
		id,
		highlightId,
		text,
	}: {
		id?: string;
		highlightId: string;
		text: string;
	}) => {
		const response = editHighlightMutation.mutate({
			id,
			highlightId,
			text,
			userId,
		});

		return response;
	};

	const resetHighlights = () => {
		annotatedPdfResetHighlightsMutation.mutate({
			id: annotatedPdfId,
		});
	};

	const panelGroupRef = useRef<ImperativePanelGroupHandle>(null);
	const setPDFViewerWidthPercentage = (pdfViewerWidth: number = 50) => {
		const panelGroup = panelGroupRef.current;
		if (panelGroup) {
			panelGroup.setLayout([pdfViewerWidth, 100 - pdfViewerWidth]);
		}
	};
	const pdfViewerMouseEvents = useClickWithoutDrag(() =>
		setPDFViewerWidthPercentage(100),
	);

	const readingIndicatorPluginInstance = readingIndicatorPlugin();
	const { ReadingIndicator } = readingIndicatorPluginInstance;

	const renderToolbar = useCallback(
		(Toolbar: (props: ToolbarProps) => React.ReactElement) => (
			<>
				<Toolbar />
				<div
					style={{
						bottom: "-0.25rem",
						position: "absolute",
						left: 0,
						// Take the full width of toolbar
						width: "100%",
					}}
				>
					<ReadingIndicator />
				</div>
			</>
		),
		[],
	);

	const defaultLayoutPluginInstance = defaultLayoutPlugin({
		renderToolbar,
	});

	const inputRef = useRef<HTMLTextAreaElement | null>(null);
	const openForest = (highlight: HighlightWithRelations) => {
		setCurrentHighlight(highlight);
		const panelGroup = panelGroupRef.current;
		if (panelGroup) {
			setPDFViewerWidthPercentage(50);
		}
	};

	const highlightPluginInstance = highlightPlugin({
		renderHighlightTarget: (props: RenderHighlightTargetProps) =>
			renderHighlightTarget({
				...props,
				openForest,
				annotatedPdfId,
				createAskHighlight,
				setCurrentHighlight,
				inputRef,
			}),
		renderHighlights: (props: RenderHighlightsProps) =>
			renderHighlights({
				...props,
				highlights,
				openForest,
				editHighlight,
				deleteHighlight,
				userId,
				userProfiles,
			}),
	});

	const { jumpToHighlightArea } = highlightPluginInstance;

	const onHighlightClick = (highlight: HighlightWithRelations) => {
		const area = highlight.highlightAreas[0];
		if (area) {
			jumpToHighlightArea(area);
		}
		selectHighlight(highlight);
	};
	// useEffect to load pdfBytes from loadedDataSource
	// useEffect(() => {
	// 	const fetchPDFBytes = async () => {
	// 		try {
	// 			const response = await fetch(`/api/pdf?url=${loadedSource}`);
	// 			const { filename, data } = await response.json()
	// 			console.log(filename, data)
	// 			setPdfBytes(new Uint8Array(data));

	// 		} catch (error) {
	// 			console.error('Failed to load PDF:', error);
	// 		}
	// 	};

	// 	fetchPDFBytes();
	// }, [loadedSource]);
	//  memoize the pdf bytes 
	const pdfBytesMemoized = useMemo(() => {
		return new Uint8Array(pdfBytes);
	}, [pdfBytes]);
	return (
		<div>
			<FloatingProfiles
				setDisplayHighlights={setFriendHighlights}
				allHighlightsWithProfile={annotatedPdfsWithProfile}
			/>

			<PanelGroup className="w-full" direction="horizontal" ref={panelGroupRef}>
				<ResizablePanel
					{...pdfViewerMouseEvents}
					className="relative"
					defaultSize={80}
					style={{ height: "100vh", overflow: "auto" }}
					collapsible
				>

					<Viewer
						// for cors protected resource (arxiv) load in server side by bytes
						// otherwise load in client side by url
						fileUrl={pdfBytesMemoized.length > 0 ? pdfBytesMemoized : loadedSource}
						plugins={[
							highlightPluginInstance,
							readingIndicatorPluginInstance,
							defaultLayoutPluginInstance,
						]}
					/>

					<div />
				</ResizablePanel>
				<ResizableHandle withHandle handleClassName="bg-[#B2B2B2]" />
				<ResizablePanel
					style={{ height: "100vh", overflow: "auto" }}
					collapsible
				>
					{currentHighlight?.node ? (
						<ReactFlowProvider>
							<Forest
								node={currentHighlight.node}
								returnHome={() => {
									document.location.hash = "";
									clearSelectedHighlight();
								}}
							/>
						</ReactFlowProvider>
					) : (
						<div className="h-full overflow-auto">
							<Sidebar
								highlights={highlights ?? []}
								deleteHighlight={deleteHighlight}
								resetHighlights={resetHighlights}
								onHighlightClick={onHighlightClick}
							/>
						</div>
					)}
				</ResizablePanel>
			</PanelGroup>
		</div>
	);
};

export default ReadingViewer;
